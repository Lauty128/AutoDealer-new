<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Subscription;
use App\Services\MercadoPagoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MercadoPagoWebhookController extends Controller
{
    protected MercadoPagoService $mpService;

    public function __construct(MercadoPagoService $mpService)
    {
        $this->mpService = $mpService;
    }

    /**
     * Handle payment notification from MercadoPago.
     */
    public function handle(Request $request)
    {
        Log::info('MercadoPago Webhook received', $request->all());

        $paymentId = null;
        $type = $request->input('type');
        $topic = $request->input('topic');

        if ($type === 'payment') {
            $paymentId = $request->input('data.id');
        } elseif ($topic === 'payment') {
            $paymentId = $request->input('id');
        }

        if (!$paymentId) {
            return response()->json(['message' => 'No payment ID found in notification'], 200);
        }

        // Fetch payment details from MercadoPago API
        $paymentDetails = $this->mpService->getPaymentDetails($paymentId);

        if (!$paymentDetails) {
            return response()->json(['message' => 'Could not retrieve payment details'], 400);
        }

        $status = $paymentDetails['status'] ?? '';
        $externalReference = $paymentDetails['external_reference'] ?? '';
        $amount = $paymentDetails['transaction_amount'] ?? 0;
        $currency = $paymentDetails['currency_id'] ?? 'ARS';
        $paymentType = $paymentDetails['payment_method_id'] ?? '';
        $preferenceId = $paymentDetails['preference_id'] ?? null;

        Log::info('MercadoPago Payment details verified', [
            'payment_id' => $paymentId,
            'status' => $status,
            'external_reference' => $externalReference,
            'amount' => $amount
        ]);

        // Process only if status is approved and external_reference matches our prefix 'sub_'
        if ($status === 'approved' && str_starts_with($externalReference, 'sub_')) {
            $subscriptionId = str_replace('sub_', '', $externalReference);
            $subscription = Subscription::with('plan')->find($subscriptionId);

            if ($subscription) {
                // Register transaction in payment history
                $payment = Payment::updateOrCreate(
                    ['mercadopago_payment_id' => $paymentId],
                    [
                        'store_id' => $subscription->store_id,
                        'subscription_id' => $subscription->id,
                        'amount' => $amount,
                        'currency' => $currency,
                        'status' => 'approved',
                        'mercadopago_preference_id' => $preferenceId,
                        'payment_type' => $paymentType,
                        'paid_at' => now(),
                    ]
                );

                // Determine new subscription coverage dates
                $plan = $subscription->plan;
                $period = $plan->billing_period === 'yearly' ? 'year' : 'month';

                // If currently active and ends_at is in the future, extend it. Otherwise start from now.
                $baseDate = ($subscription->status === 'active' && $subscription->ends_at && $subscription->ends_at->isFuture())
                    ? $subscription->ends_at
                    : now();

                $newEndsAt = $period === 'year' ? $baseDate->copy()->addYear() : $baseDate->copy()->addMonth();

                $subscription->update([
                    'status' => 'active',
                    'starts_at' => $subscription->starts_at ?? now(),
                    'ends_at' => $newEndsAt,
                ]);

                Log::info('Subscription successfully activated/renewed via webhook', [
                    'subscription_id' => $subscription->id,
                    'store_id' => $subscription->store_id,
                    'ends_at' => $newEndsAt->toDateTimeString()
                ]);
            } else {
                Log::warning('Subscription not found for payment', ['subscription_id' => $subscriptionId]);
            }
        }

        // We return a 200 OK to MercadoPago to confirm receipt of the webhook.
        return response()->json(['message' => 'Webhook processed successfully'], 200);
    }
}
