<?php

namespace App\Jobs;

use App\Models\Store;
use App\Models\Vehicle;
use App\Services\MetaApiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncVehicleToMetaCatalog implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected int $storeId;

    protected int $retailerId;

    protected string $method;

    /**
     * Create a new job instance.
     */
    public function __construct(int $storeId, int $retailerId, string $method)
    {
        $this->storeId = $storeId;
        $this->retailerId = $retailerId;
        $this->method = strtoupper($method); // CREATE, UPDATE, DELETE
    }

    /**
     * Execute the job.
     */
    public function handle(MetaApiService $metaApiService): void
    {
        $store = Store::find($this->storeId);
        if (! $store || ! $store->whatsapp_access_token || ! $store->whatsapp_catalog_id) {
            Log::warning("SyncVehicleToMetaCatalog: Store {$this->storeId} not found or missing WhatsApp configurations.");

            return;
        }

        // Set the store token on the API service
        $metaApiService = $metaApiService->withToken($store->whatsapp_access_token);

        if ($this->method === 'DELETE') {
            Log::info("SyncVehicleToMetaCatalog: Deleting product {$this->retailerId} from catalog {$store->whatsapp_catalog_id}.");
            try {
                $metaApiService->deleteProduct($store->whatsapp_catalog_id, $this->retailerId);
            } catch (\Exception $e) {
                Log::error("SyncVehicleToMetaCatalog: Error deleting product {$this->retailerId}: ".$e->getMessage());
                throw $e;
            }

            return;
        }

        // For CREATE/UPDATE, load the vehicle
        $vehicle = Vehicle::with(['mark', 'images'])->find($this->retailerId);
        if (! $vehicle) {
            Log::warning("SyncVehicleToMetaCatalog: Vehicle {$this->retailerId} not found for store {$this->storeId}.");
            // If the vehicle was deleted, delete it from Meta as well to be safe
            try {
                $metaApiService->deleteProduct($store->whatsapp_catalog_id, $this->retailerId);
            } catch (\Exception $e) {
                Log::error('SyncVehicleToMetaCatalog (Fallback Delete): Error: '.$e->getMessage());
            }

            return;
        }

        // Check if vehicle belongs to the store
        if ($vehicle->store_id !== $this->storeId) {
            Log::error("SyncVehicleToMetaCatalog: Vehicle {$this->retailerId} store mismatch (Expected {$this->storeId}, got {$vehicle->store_id}).");

            return;
        }

        Log::info("SyncVehicleToMetaCatalog: Syncing product {$vehicle->id} to catalog {$store->whatsapp_catalog_id}.");

        try {
            $metaApiService->syncVehicle($store, $vehicle);
        } catch (\Exception $e) {
            Log::error("SyncVehicleToMetaCatalog: Error syncing vehicle {$vehicle->id}: ".$e->getMessage());
            throw $e;
        }
    }
}
