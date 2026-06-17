<?php

namespace App\Http\Middleware;

use App\Models\Store;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscription
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Superadmins are exempted from subscription limits.
        if ($request->user() && $request->user()->is_superadmin) {
            return $next($request);
        }

        // 2. Resolve the store depending on whether it is a public catalog or dashboard request.
        $store = null;

        if ($request->route()->hasParameter('store')) {
            // Public catalog route: e.g. /concesionario/{store}/{vehicle?}
            $storeId = $request->route('store');
            $store = Store::where('id', $storeId)->orWhere('slug', $storeId)->first();
        } elseif ($request->user()) {
            // Dashboard route
            $user = $request->user();
            $stores = $user->stores;

            if ($stores->isNotEmpty()) {
                $activeStoreId = (int) $request->input('store_id', $stores->first()->id);
                // Ensure user actually has access to this store
                if ($stores->pluck('id')->contains($activeStoreId)) {
                    $store = Store::find($activeStoreId);
                } else {
                    $store = $stores->first();
                }
            }
        }

        // 3. If a store is resolved, check its active subscription status.
        if ($store) {
            $subscription = $store->activeSubscription;

            if (!$subscription || !$subscription->isActive()) {
                // If it's a public request, return the custom inactive catalog page.
                if ($request->route()->getName() === 'public.catalog') {
                    return response()->view('public.inactive', ['store' => $store], 403);
                }

                // If it's a dashboard request, redirect to billing (unless already visiting billing/checkout).
                if ($request->user()) {
                    if ($request->is('dashboard/billing') || $request->is('dashboard/billing/*')) {
                        return $next($request);
                    }

                    return redirect()->route('billing.index', ['store_id' => $store->id])
                        ->with('warning', 'Tu suscripción o período de prueba para ' . $store->name . ' ha vencido. Por favor, suscríbete para reactivar tus funciones de gestión.');
                }
            }
        }

        return $next($request);
    }
}
