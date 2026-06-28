<?php

namespace App\Services;

use App\Models\Store;
use App\Models\Vehicle;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MetaApiService
{
    protected ?string $accessToken;

    protected string $apiVersion;

    protected string $baseUrl = 'https://graph.facebook.com';

    public function __construct()
    {
        $this->accessToken = config('services.meta.access_token');
        $this->apiVersion = config('services.meta.api_version', 'v20.0');
    }

    /**
     * Set a custom access token for the current instance (useful for store-specific tokens).
     */
    public function withToken(string $token): self
    {
        $this->accessToken = $token;

        return $this;
    }

    /**
     * Check if the access token is configured.
     */
    public function isConfigured(): bool
    {
        return ! empty($this->accessToken);
    }

    /**
     * Get a configured HTTP client instance.
     * Disables SSL verification in local/testing environments.
     */
    protected function client()
    {
        $client = Http::withToken($this->accessToken);

        if (app()->environment('local', 'testing')) {
            $client = $client->withoutVerifying();
        }

        return $client;
    }

    /**
     * Generate Meta OAuth authorization URL.
     */
    public function getAuthUrl(int $storeId, string $redirectUri): string
    {
        $appId = config('services.meta.app_id');
        $scopes = 'catalog_management,business_management';

        return "https://www.facebook.com/{$this->apiVersion}/dialog/oauth?".http_build_query([
            'client_id' => $appId,
            'redirect_uri' => $redirectUri,
            'state' => $storeId,
            'scope' => $scopes,
            'response_type' => 'code',
        ]);
    }

    /**
     * Exchange short-lived OAuth authorization code for a long-lived user access token.
     */
    public function exchangeCodeForToken(string $code, string $redirectUri): string
    {
        $appId = config('services.meta.app_id');
        $appSecret = config('services.meta.app_secret');

        // 1. Exchange authorization code for short-lived access token
        $response = Http::get("{$this->baseUrl}/{$this->apiVersion}/oauth/access_token", [
            'client_id' => $appId,
            'redirect_uri' => $redirectUri,
            'client_secret' => $appSecret,
            'code' => $code,
        ]);

        if (! $response->successful()) {
            Log::error('Meta API - Error exchanging code', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception('Error al cambiar el código de autorización: '.($response->json()['error']['message'] ?? 'Error desconocido'));
        }

        $shortToken = $response->json()['access_token'];

        // 2. Exchange short-lived token for long-lived user access token
        $exchangeResponse = Http::get("{$this->baseUrl}/{$this->apiVersion}/oauth/access_token", [
            'grant_type' => 'fb_exchange_token',
            'client_id' => $appId,
            'client_secret' => $appSecret,
            'fb_exchange_token' => $shortToken,
        ]);

        if (! $exchangeResponse->successful()) {
            Log::error('Meta API - Error exchanging for long-lived token', [
                'status' => $exchangeResponse->status(),
                'body' => $exchangeResponse->body(),
            ]);
            throw new \Exception('Error al obtener token de larga duración: '.($exchangeResponse->json()['error']['message'] ?? 'Error desconocido'));
        }

        return $exchangeResponse->json()['access_token'];
    }

    /**
     * Get businesses accessible by the user (both owned and shared).
     */
    public function getBusinesses(): array
    {
        if (! $this->isConfigured()) {
            throw new \Exception('Token de acceso no configurado.');
        }

        try {
            // Fetch owned businesses
            $response = $this->client()->get("{$this->baseUrl}/{$this->apiVersion}/me/owned_businesses");
            $owned = $response->successful() ? ($response->json()['data'] ?? []) : [];

            // Fetch shared/accessed businesses
            $responseShared = $this->client()->get("{$this->baseUrl}/{$this->apiVersion}/me/businesses");
            $shared = $responseShared->successful() ? ($responseShared->json()['data'] ?? []) : [];

            // Merge and de-duplicate by ID
            return collect(array_merge($owned, $shared))->unique('id')->values()->toArray();
        } catch (\Exception $e) {
            Log::error('Meta API - Exception in getBusinesses: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Get catalogs linked to a business.
     */
    public function getCatalogs(string $businessId): array
    {
        if (! $this->isConfigured()) {
            throw new \Exception('Token de acceso no configurado.');
        }

        try {
            $response = $this->client()->get("{$this->baseUrl}/{$this->apiVersion}/{$businessId}/owned_product_catalogs");
            if ($response->successful()) {
                return $response->json()['data'] ?? [];
            }

            Log::error('Meta API - Error fetching catalogs', [
                'businessId' => $businessId,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception($response->json()['error']['message'] ?? 'Error al obtener catálogos.');
        } catch (\Exception $e) {
            Log::error('Meta API - Exception in getCatalogs: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Format vehicle data for the Meta Catalog schema.
     */
    public function formatVehicleForCatalog(Store $store, Vehicle $vehicle): array
    {
        $title = trim(($vehicle->mark?->name ?? '').' '.$vehicle->model.' '.$vehicle->year);
        $description = $vehicle->description ?: $title;
        $availability = $vehicle->status === 'available' ? 'in stock' : 'out of stock';

        $priceVal = round($vehicle->price);
        $currency = strtoupper($vehicle->currency ?: 'USD');
        $priceString = "{$priceVal} {$currency}";

        // Build absolute URL for public detail page
        $link = route('public.catalog', ['store' => $store->slug ?: $store->id, 'vehicle' => $vehicle->slug ?: $vehicle->id], true);

        // Build absolute URL for cover image
        $imageLink = '';
        if ($vehicle->cover_image) {
            $imageLink = str_starts_with($vehicle->cover_image, 'http')
                ? $vehicle->cover_image
                : asset($vehicle->cover_image);
        } else {
            $imageLink = $store->logo
                ? (str_starts_with($store->logo, 'http') ? $store->logo : asset($store->logo))
                : 'https://placehold.co/600x400?text='.urlencode($title);
        }

        $brand = $vehicle->mark?->name ?: 'Genérico';

        $data = [
            'id' => "{$vehicle->id}",
            'title' => $title,
            'description' => $description,
            'availability' => $availability,
            'condition' => 'used',
            'price' => $priceString,
            'link' => $link,
            'image_link' => $imageLink,
            'brand' => $brand,
        ];

        // Gather additional images (first 10 max)
        $additionalImages = $vehicle->images()
            ->orderBy('sort_order')
            ->pluck('path')
            ->map(function ($path) {
                return str_starts_with($path, 'http') ? $path : asset($path);
            })
            ->filter(fn ($url) => $url !== $imageLink)
            ->take(10)
            ->values()
            ->toArray();

        if (! empty($additionalImages)) {
            $data['additional_image_urls'] = $additionalImages;
        }

        return $data;
    }

    /**
     * Sincroniza un vehículo individual usando el endpoint batch.
     */
    public function syncVehicle(Store $store, Vehicle $vehicle): void
    {
        $catalogId = $store->whatsapp_catalog_id;
        if (! $catalogId) {
            throw new \Exception("ID de catálogo no configurado para el concesionario {$store->id}.");
        }

        $formatted = $this->formatVehicleForCatalog($store, $vehicle);

        $payload = [
            'item_type' => 'PRODUCT_ITEM',
            'allow_upsert' => true,
            'requests' => [
                [
                    'method' => 'UPDATE',
                    'data' => $formatted,
                ],
            ],
        ];

        $response = $this->client()->post("{$this->baseUrl}/{$this->apiVersion}/{$catalogId}/items_batch", $payload);

        if (! $response->successful()) {
            Log::error('Meta API - Error in syncVehicle', [
                'storeId' => $store->id,
                'vehicleId' => $vehicle->id,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception($response->json()['error']['message'] ?? 'Error al sincronizar vehículo con Meta.');
        }

        Log::info("Meta API - Vehicle {$vehicle->id} synced successfully to catalog {$catalogId}.");
    }

    /**
     * Elimina un producto del catálogo de Meta.
     */
    public function deleteProduct(string $catalogId, int $retailerId): void
    {
        $payload = [
            'item_type' => 'PRODUCT_ITEM',
            'requests' => [
                [
                    'method' => 'DELETE',
                    'data' => [
                        'id' => "{$retailerId}",
                    ],
                ],
            ],
        ];

        $response = $this->client()->post("{$this->baseUrl}/{$this->apiVersion}/{$catalogId}/items_batch", $payload);

        if (! $response->successful()) {
            Log::error('Meta API - Error in deleteProduct', [
                'catalogId' => $catalogId,
                'retailerId' => $retailerId,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception($response->json()['error']['message'] ?? 'Error al eliminar producto del catálogo.');
        }

        Log::info("Meta API - Product {$retailerId} deleted successfully from catalog {$catalogId}.");
    }

    /**
     * Sincroniza todos los vehículos del concesionario en un solo lote.
     */
    public function syncAllVehicles(Store $store): int
    {
        $catalogId = $store->whatsapp_catalog_id;
        if (! $catalogId) {
            throw new \Exception("ID de catálogo no configurado para el concesionario {$store->id}.");
        }

        $vehicles = Vehicle::with(['mark', 'images'])
            ->where('store_id', $store->id)
            ->get();

        if ($vehicles->isEmpty()) {
            return 0;
        }

        $requests = $vehicles->map(function ($vehicle) use ($store) {
            return [
                'method' => 'UPDATE',
                'data' => $this->formatVehicleForCatalog($store, $vehicle),
            ];
        })->toArray();

        // Chunk by 1000 items (Meta limit is 5000)
        $chunks = array_chunk($requests, 1000);
        $totalSynced = 0;

        foreach ($chunks as $chunk) {
            $payload = [
                'item_type' => 'PRODUCT_ITEM',
                'allow_upsert' => true,
                'requests' => $chunk,
            ];

            $response = $this->client()->post("{$this->baseUrl}/{$this->apiVersion}/{$catalogId}/items_batch", $payload);

            if (! $response->successful()) {
                Log::error('Meta API - Error in syncAllVehicles batch', [
                    'storeId' => $store->id,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                throw new \Exception($response->json()['error']['message'] ?? 'Error al sincronizar lote de vehículos con Meta.');
            }

            $totalSynced += count($chunk);
        }

        return $totalSynced;
    }

    /**
     * Get the phone numbers linked to a WABA.
     */
    public function getPhoneNumbers(string $wabaId): array
    {
        if (! $this->isConfigured()) {
            throw new \Exception('Token de acceso no configurado.');
        }

        try {
            $response = $this->client()
                ->get("{$this->baseUrl}/{$this->apiVersion}/{$wabaId}/phone_numbers");

            if ($response->successful()) {
                return $response->json()['data'] ?? [];
            }

            $errorData = $response->json();
            $error = $errorData['error']['message'] ?? 'Error al consultar números de teléfono.';
            throw new \Exception($error);
        } catch (\Exception $e) {
            Log::error('Meta API Exception - getPhoneNumbers: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Get the product catalogs linked to a WABA.
     */
    public function getProductCatalogs(string $wabaId): array
    {
        if (! $this->isConfigured()) {
            throw new \Exception('Token de acceso no configurado.');
        }

        try {
            $response = $this->client()
                ->get("{$this->baseUrl}/{$this->apiVersion}/{$wabaId}/product_catalogs");

            if ($response->successful()) {
                return $response->json()['data'] ?? [];
            }

            $errorData = $response->json();
            $error = $errorData['error']['message'] ?? 'Error al consultar catálogos.';
            throw new \Exception($error);
        } catch (\Exception $e) {
            Log::error('Meta API Exception - getProductCatalogs: '.$e->getMessage());
            throw $e;
        }
    }
}
