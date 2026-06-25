<?php

namespace App\Services;

use App\Models\Vehicle;
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
        Log::info('WhatsAppService: Creating catalog item for vehicle', [
            'vehicle_id' => $vehicle->id,
            'store_id' => $vehicle->store_id,
            'model' => $vehicle->model,
        ]);

        // Place mock integration or real API call here in the future
        // For now, we return a mock WhatsApp ID prefix 'WA-' followed by vehicle ID
        $mockExternalId = 'WA-'.$vehicle->id.rand(1000, 9999);

        Log::info('WhatsAppService: Catalog item created successfully', [
            'vehicle_id' => $vehicle->id,
            'external_id' => $mockExternalId,
        ]);

        return $mockExternalId;
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

        Log::info('WhatsAppService: Updating catalog item for vehicle', [
            'vehicle_id' => $vehicle->id,
            'external_id' => $vehicle->whatsapp_id,
            'price' => $vehicle->price,
        ]);

        // Place mock integration or real API call here in the future

        return true;
    }

    /**
     * Delete an existing vehicle catalog item from WhatsApp.
     *
     * @return bool True if successful, false otherwise.
     */
    public function deleteCatalogItem(string $externalId, int $storeId): bool
    {
        Log::info('WhatsAppService: Deleting catalog item', [
            'external_id' => $externalId,
            'store_id' => $storeId,
        ]);

        // Place mock integration or real API call here in the future

        return true;
    }
}
