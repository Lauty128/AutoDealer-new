<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Plan;
use App\Models\Store;
use App\Models\Subscription;
use App\Services\MercadoPagoService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    protected MercadoPagoService $mpService;

    public function __construct(MercadoPagoService $mpService)
    {
        $this->mpService = $mpService;
    }

    /**
     * Display the billing dashboard workspace.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $stores = $user->stores;

        if ($stores->isEmpty()) {
            return Inertia::render('billing', [
                'stores' => [],
                'activeStoreId' => null,
                'subscription' => null,
                'payments' => [],
            ]);
        }

        // Resolve active store ID
        $activeStoreId = (int) $request->input('store_id', $stores->first()->id);

        if (!$stores->pluck('id')->contains($activeStoreId)) {
            $activeStoreId = (int) $stores->first()->id;
        }

        $store = Store::with('activeSubscription.plan')->find($activeStoreId);

        // Load active subscription (or auto-create trial if it doesn't exist for some reason)
        $subscription = $store->activeSubscription;
        if (!$subscription) {
            $defaultPlan = Plan::where('slug', 'premium')->first();
            if ($defaultPlan) {
                $subscription = Subscription::create([
                    'store_id' => $store->id,
                    'plan_id' => $defaultPlan->id,
                    'status' => 'trialing',
                    'trial_ends_at' => $store->created_at->addDays($defaultPlan->trial_days),
                ]);
                $subscription->load('plan');
            }
        }

        // Load payment history
        $payments = Payment::where('store_id', $store->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('billing', [
            'stores' => $stores,
            'activeStoreId' => $activeStoreId,
            'subscription' => $subscription,
            'payments' => $payments,
            'flash' => [
                'warning' => session('warning'),
                'success' => session('success'),
                'error' => session('error'),
            ]
        ]);
    }

    /**
     * Generate MercadoPago Checkout Preference and redirect user to Checkout Pro.
     */
    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'store_id' => 'required|integer|exists:stores,id',
        ]);

        $storeId = $validated['store_id'];
        $user = $request->user();

        // Security check: ensure user is owner or manager
        $userStore = $user->stores()->where('store_id', $storeId)->first();
        if (!$userStore || !in_array($userStore->pivot->role, ['owner', 'manager'])) {
            return back()->with('error', 'No tienes permisos para gestionar los pagos de este concesionario.');
        }

        $store = Store::with('activeSubscription.plan')->find($storeId);
        $subscription = $store->activeSubscription;

        if (!$subscription) {
            $defaultPlan = Plan::where('slug', 'premium')->firstOrFail();
            $subscription = Subscription::create([
                'store_id' => $store->id,
                'plan_id' => $defaultPlan->id,
                'status' => 'pending_payment',
            ]);
            $subscription->load('plan');
        }

        $plan = $subscription->plan;

        // Create Checkout Pro Preference
        $title = "Suscripción " . $plan->name . " - " . $store->name;
        $price = (float)$plan->price;
        $currency = $plan->currency;
        $externalReference = "sub_" . $subscription->id;

        $backUrls = [
            'success' => route('billing.success'),
            'pending' => route('billing.pending'),
            'failure' => route('billing.failure'),
        ];

        $preference = $this->mpService->createPreference($title, $price, $currency, $externalReference, $backUrls);

        if (!$preference) {
            return back()->with('error', 'No se pudo generar la preferencia de pago de MercadoPago. Por favor, intenta de nuevo.');
        }

        // Save preference ID in subscription
        $subscription->update([
            'mercadopago_preference_id' => $preference['id'] ?? null,
        ]);

        // Get checkout redirect link (sandbox vs production)
        $sandbox = config('services.mercadopago.sandbox', true);
        $checkoutUrl = $sandbox ? ($preference['sandbox_init_point'] ?? '') : ($preference['init_point'] ?? '');

        if (empty($checkoutUrl)) {
            return back()->with('error', 'Error al obtener el enlace de pago de MercadoPago.');
        }

        // We use Inertia::location to perform a full redirect outside the SPA router
        return Inertia::location($checkoutUrl);
    }

    /**
     * Callback on successful checkout payment.
     */
    public function success(Request $request)
    {
        return redirect()->route('billing.index')->with([
            'success' => '¡Pago registrado y en proceso de aprobación! Tu suscripción se activará en unos momentos.'
        ]);
    }

    /**
     * Callback on pending checkout payment.
     */
    public function pending(Request $request)
    {
        return redirect()->route('billing.index')->with([
            'warning' => 'El pago está en proceso de verificación por MercadoPago. Te notificaremos cuando se apruebe.'
        ]);
    }

    /**
     * Callback on failed checkout payment.
     */
    public function failure(Request $request)
    {
        return redirect()->route('billing.index')->with([
            'error' => 'El pago no pudo completarse. Por favor, intenta nuevamente.'
        ]);
    }
}
