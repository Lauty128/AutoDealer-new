<?php

namespace App\Services;

use App\Models\Vehicle;
use Illuminate\Support\Facades\Log;

class MercadoLibreService
{
    /**
     * Create a new vehicle listing on Mercado Libre.
     *
     * @return string|null The external Mercado Libre listing ID, or null on failure.
     */
    public function createListing(Vehicle $vehicle): ?string
    {
        Log::info('MercadoLibreService: Creating listing for vehicle', [
            'vehicle_id' => $vehicle->id,
            'store_id' => $vehicle->store_id,
            'model' => $vehicle->model,
        ]);

        // Place mock integration or real API call here in the future
        // For now, we return a mock Mercado Libre ID prefix 'MLA-' followed by vehicle ID
        $mockExternalId = 'MLA-'.$vehicle->id.rand(1000, 9999);

        Log::info('MercadoLibreService: Listing created successfully', [
            'vehicle_id' => $vehicle->id,
            'external_id' => $mockExternalId,
        ]);

        return $mockExternalId;
    }

    /**
     * Update an existing vehicle listing on Mercado Libre.
     *
     * @return bool True if successful, false otherwise.
     */
    public function updateListing(Vehicle $vehicle): bool
    {
        if (empty($vehicle->mercadolibre_id)) {
            Log::warning('MercadoLibreService: Cannot update vehicle without Mercado Libre ID', [
                'vehicle_id' => $vehicle->id,
            ]);

            return false;
        }

        Log::info('MercadoLibreService: Updating listing for vehicle', [
            'vehicle_id' => $vehicle->id,
            'external_id' => $vehicle->mercadolibre_id,
            'price' => $vehicle->price,
        ]);

        // Place mock integration or real API call here in the future

        return true;
    }

    /**
     * Delete/Pause an existing vehicle listing on Mercado Libre.
     *
     * @return bool True if successful, false otherwise.
     */
    public function deleteListing(string $externalId, int $storeId): bool
    {
        Log::info('MercadoLibreService: Deleting/Pausing listing', [
            'external_id' => $externalId,
            'store_id' => $storeId,
        ]);

        // Place mock integration or real API call here in the future

        return true;
    }
}
