<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MercadoPagoService
{
    protected string $token;
    protected string $baseUrl = 'https://api.mercadopago.com';

    public function __construct()
    {
        $this->token = config('services.mercadopago.token', '');
    }

    /**
     * Create a Checkout Pro preference for subscription payment.
     *
     * @param string $title
     * @param float $price
     * @param string $currency
     * @param string $externalReference
     * @param array $backUrls
     * @return array|null Returns preference array containing init_point or null on failure.
     */
    public function createPreference(string $title, float $price, string $currency, string $externalReference, array $backUrls): ?array
    {
        if (empty($this->token)) {
            Log::error('MercadoPago Access Token not configured.');
            return null;
        }

        // Generate webhook URL
        $webhookUrl = route('webhooks.mercadopago');

        // Defensive validation: MercadoPago API requires an HTTPS public URL for webhooks.
        // If testing on localhost, we pass a dummy public URL to bypass validation.
        if (str_contains($webhookUrl, 'localhost') || str_contains($webhookUrl, '127.0.0.1') || app()->environment('testing')) {
            $webhookUrl = 'https://autodealer-webhook-sandbox.com/webhooks/mercadopago';
        }

        // Defensive validation for back_urls: MercadoPago rejects localhost/127.0.0.1 addresses,
        // which triggers "auto_return invalid" errors since it filters them out.
        // We replace local hosts with a dummy public domain for local testing/sandbox generation.
        foreach ($backUrls as $key => $url) {
            if (str_contains($url, 'localhost') || str_contains($url, '127.0.0.1')) {
                $backUrls[$key] = str_replace(
                    [
                        'http://localhost:8000', 'https://localhost:8000',
                        'http://localhost', 'https://localhost',
                        'http://127.0.0.1:8000', 'https://127.0.0.1:8000',
                        'http://127.0.0.1', 'https://127.0.0.1'
                    ],
                    'https://autodealer-webhook-sandbox.com',
                    $url
                );
            }
        }

        $payload = [
            'items' => [
                [
                    'title' => $title,
                    'quantity' => 1,
                    'unit_price' => $price,
                    'currency_id' => $currency,
                ]
            ],
            'back_urls' => $backUrls,
            'auto_return' => 'approved',
            'external_reference' => $externalReference,
            'notification_url' => $webhookUrl,
        ];

        try {
            $response = Http::withToken($this->token)
                ->post("{$this->baseUrl}/checkout/preferences", $payload);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Failed to create MercadoPago Preference', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
        } catch (\Exception $e) {
            Log::error('MercadoPago Preference Request Error: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Retrieve payment details from MercadoPago by Payment ID.
     *
     * @param string $paymentId
     * @return array|null Details array or null on failure.
     */
    public function getPaymentDetails(string $paymentId): ?array
    {
        if (empty($this->token)) {
            Log::error('MercadoPago Access Token not configured.');
            return null;
        }

        try {
            $response = Http::withToken($this->token)
                ->get("{$this->baseUrl}/v1/payments/{$paymentId}");

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Failed to fetch MercadoPago payment details', [
                'payment_id' => $paymentId,
                'status' => $response->status(),
                'body' => $response->body()
            ]);
        } catch (\Exception $e) {
            Log::error('MercadoPago Fetch Payment Error: ' . $e->getMessage());
        }

        return null;
    }
}
