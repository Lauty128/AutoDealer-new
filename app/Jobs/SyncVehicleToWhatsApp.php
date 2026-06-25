<?php

namespace App\Jobs;

use App\Models\Vehicle;
use App\Services\WhatsAppService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SyncVehicleToWhatsApp implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $vehicleId,
        public int $storeId,
        public string $action,
        public ?string $externalId = null
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(WhatsAppService $service): void
    {
        switch ($this->action) {
            case 'created':
                $vehicle = Vehicle::find($this->vehicleId);
                if ($vehicle) {
                    $waId = $service->createCatalogItem($vehicle);
                    if ($waId) {
                        // Update vehicle quietly without triggering observers again
                        $vehicle->withoutEvents(function () use ($vehicle, $waId) {
                            $vehicle->update(['whatsapp_id' => $waId]);
                        });
                    }
                }
                break;

            case 'updated':
                $vehicle = Vehicle::find($this->vehicleId);
                if ($vehicle && $vehicle->whatsapp_id) {
                    $service->updateCatalogItem($vehicle);
                } elseif ($vehicle) {
                    // If it was somehow created without WA ID, create it now
                    $waId = $service->createCatalogItem($vehicle);
                    if ($waId) {
                        $vehicle->withoutEvents(function () use ($vehicle, $waId) {
                            $vehicle->update(['whatsapp_id' => $waId]);
                        });
                    }
                }
                break;

            case 'deleted':
                if ($this->externalId) {
                    $service->deleteCatalogItem($this->externalId, $this->storeId);
                }
                break;
        }
    }
}
