<?php

namespace App\Services;

use App\Models\Store;
use App\Models\Vehicle;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    /**
     * Create a new vehicle catalog item on WhatsApp.
     *
     * @return string|null The external WhatsApp catalog item ID, or null on failure.
     */
    public function createCatalogItem(Vehicle $vehicle): ?string
    {
        $store = $vehicle->store ?: $vehicle->load('store')->store;
        $catalogId = $store?->whatsapp_catalog_id;
        $accessToken = config('services.meta.access_token');

        if (empty($catalogId) || empty($accessToken)) {
            Log::warning('WhatsAppService: Missing Meta catalog configuration for store ' . $vehicle->store_id);
            return null;
        }

        Log::info('WhatsAppService: Creating catalog item for vehicle', [
            'vehicle_id' => $vehicle->id,
            'store_id' => $vehicle->store_id,
            'model' => $vehicle->model,
        ]);

        // Obtener datos del vehiculo
        $brand = $vehicle->mark ? $vehicle->mark->name : 'Genérico';
        $title = $brand . ' ' . $vehicle->model . ' ' . $vehicle->year;
        $description = "Vehículo {$brand} {$vehicle->model} año {$vehicle->year} en excelentes condiciones.";
        
        $priceFormatted = number_format($vehicle->price, 2, '.', '') . ' ' . $vehicle->currency;
        $availability = $vehicle->status === 'available' ? 'in stock' : 'out of stock';

        $link = $vehicle->store ? route('public.catalog', [$vehicle->store->slug, $vehicle->slug]) : url('/');
        $imageLink = $vehicle->cover_image ? (str_starts_with($vehicle->cover_image, 'http') ? $vehicle->cover_image : url($vehicle->cover_image)) : 'https://placehold.co/600x400?text=No+Image';

        $retailerId = 'vehicle_' . $vehicle->id;

        $response = Http::withToken($accessToken)
            ->post("https://graph.facebook.com/v18.0/{$catalogId}/items_batch", [
                'item_type' => 'PRODUCT_ITEM',
                'requests' => [
                    [
                        'method' => 'CREATE',
                        'retailer_id' => $retailerId,
                        'data' => [
                            'title' => $title,
                            'description' => $description,
                            'availability' => $availability,
                            'condition' => 'used',
                            'price' => $priceFormatted,
                            'link' => $link,
                            'image_link' => $imageLink,
                            'brand' => $brand,
                        ],
                    ],
                ],
            ]);

        if ($response->successful()) {
            Log::info('WhatsAppService: Catalog item created successfully', [
                'vehicle_id' => $vehicle->id,
                'external_id' => $retailerId,
            ]);

            return $retailerId;
        }

        Log::error('WhatsAppService: Failed to create catalog item', [
            'vehicle_id' => $vehicle->id,
            'status' => $response->status(),
            'response' => $response->json(),
        ]);

        return null;
    }

    /**
     * Update an existing vehicle catalog item on WhatsApp.
     *
     * @return bool True if successful, false otherwise.
     */
    public function updateCatalogItem(Vehicle $vehicle): bool
    {
        if (empty($vehicle->whatsapp_id)) {
            Log::warning('WhatsAppService: Cannot update vehicle without WhatsApp ID', [
                'vehicle_id' => $vehicle->id,
            ]);

            return false;
        }

        $store = $vehicle->store ?: $vehicle->load('store')->store;
        $catalogId = $store?->whatsapp_catalog_id;
        $accessToken = config('services.meta.access_token');

        if (empty($catalogId) || empty($accessToken)) {
            Log::warning('WhatsAppService: Missing Meta catalog configuration for store ' . $vehicle->store_id);
            return false;
        }

        Log::info('WhatsAppService: Updating catalog item for vehicle', [
            'vehicle_id' => $vehicle->id,
            'external_id' => $vehicle->whatsapp_id,
            'price' => $vehicle->price,
        ]);

        $brand = $vehicle->mark ? $vehicle->mark->name : 'Genérico';
        $title = $brand . ' ' . $vehicle->model . ' ' . $vehicle->year;
        $description = $vehicle->description ?: "Vehículo {$brand} {$vehicle->model} año {$vehicle->year} en excelentes condiciones.";
        
        $priceFormatted = number_format($vehicle->price, 2, '.', '') . ' ' . $vehicle->currency;
        $availability = $vehicle->status === 'available' ? 'in stock' : 'out of stock';

        $link = $vehicle->store ? route('public.catalog', [$vehicle->store->slug, $vehicle->slug]) : url('/');
        $imageLink = $vehicle->cover_image ? (str_starts_with($vehicle->cover_image, 'http') ? $vehicle->cover_image : url($vehicle->cover_image)) : 'https://placehold.co/600x400?text=No+Image';

        $response = Http::withToken($accessToken)
            ->post("https://graph.facebook.com/v18.0/{$catalogId}/items_batch", [
                'item_type' => 'PRODUCT_ITEM',
                'requests' => [
                    [
                        'method' => 'UPDATE',
                        'retailer_id' => $vehicle->whatsapp_id,
                        'data' => [
                            'title' => $title,
                            'description' => $description,
                            'availability' => $availability,
                            'condition' => 'used',
                            'price' => $priceFormatted,
                            'link' => $link,
                            'image_link' => $imageLink,
                            'brand' => $brand,
                        ],
                    ],
                ],
            ]);

        if ($response->successful()) {
            return true;
        }

        Log::error('WhatsAppService: Failed to update catalog item', [
            'vehicle_id' => $vehicle->id,
            'status' => $response->status(),
            'response' => $response->json(),
        ]);

        return false;
    }

    /**
     * Delete an existing vehicle catalog item from WhatsApp.
     *
     * @return bool True if successful, false otherwise.
     */
    public function deleteCatalogItem(string $externalId, int $storeId): bool
    {
        $store = Store::find($storeId);
        $catalogId = $store?->whatsapp_catalog_id;
        $accessToken = config('services.meta.access_token');

        if (empty($catalogId) || empty($accessToken)) {
            Log::warning('WhatsAppService: Missing Meta catalog configuration for store ' . $storeId);
            return false;
        }

        Log::info('WhatsAppService: Deleting catalog item', [
            'external_id' => $externalId,
            'store_id' => $storeId,
        ]);

        $response = Http::withToken($accessToken)
            ->post("https://graph.facebook.com/v18.0/{$catalogId}/items_batch", [
                'item_type' => 'PRODUCT_ITEM',
                'requests' => [
                    [
                        'method' => 'DELETE',
                        'retailer_id' => $externalId,
                    ],
                ],
            ]);

        if ($response->successful()) {
            return true;
        }

        Log::error('WhatsAppService: Failed to delete catalog item', [
            'external_id' => $externalId,
            'status' => $response->status(),
            'response' => $response->json(),
        ]);

        return false;
    }
}
