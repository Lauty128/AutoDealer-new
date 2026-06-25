<?php

namespace App\Jobs;

use App\Models\Vehicle;
use App\Services\MercadoLibreService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SyncVehicleToMercadoLibre implements ShouldQueue
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
    public function handle(MercadoLibreService $service): void
    {
        switch ($this->action) {
            case 'created':
                $vehicle = Vehicle::find($this->vehicleId);
                if ($vehicle) {
                    $mlId = $service->createListing($vehicle);
                    if ($mlId) {
                        // Update vehicle quietly without triggering observers again
                        $vehicle->withoutEvents(function () use ($vehicle, $mlId) {
                            $vehicle->update(['mercadolibre_id' => $mlId]);
                        });
                    }
                }
                break;

            case 'updated':
                $vehicle = Vehicle::find($this->vehicleId);
                if ($vehicle && $vehicle->mercadolibre_id) {
                    $service->updateListing($vehicle);
                } elseif ($vehicle) {
                    // If it was somehow created without ML ID, create it now
                    $mlId = $service->createListing($vehicle);
                    if ($mlId) {
                        $vehicle->withoutEvents(function () use ($vehicle, $mlId) {
                            $vehicle->update(['mercadolibre_id' => $mlId]);
                        });
                    }
                }
                break;

            case 'deleted':
                if ($this->externalId) {
                    $service->deleteListing($this->externalId, $this->storeId);
                }
                break;
        }
    }
}
