<?php

namespace App\Observers;

use App\Jobs\SyncVehicleToMercadoLibre;
use App\Jobs\SyncVehicleToWhatsApp;
use App\Models\Vehicle;

class VehicleObserver
{
    /**
     * Set to true to execute observer actions only after database transaction commits.
     *
     * @var bool
     */
    public $afterCommit = true;

    /**
     * Handle the Vehicle "created" event.
     */
    public function created(Vehicle $vehicle): void
    {
        SyncVehicleToMercadoLibre::dispatch(
            $vehicle->id,
            $vehicle->store_id,
            'created'
        );

        $store = $vehicle->store;
        if ($store && ! empty($store->whatsapp_catalog_id)) {
            SyncVehicleToWhatsApp::dispatch(
                $vehicle->id,
                $vehicle->store_id,
                'created'
            );
        }
    }

    /**
     * Handle the Vehicle "updated" event.
     */
    public function updated(Vehicle $vehicle): void
    {
        SyncVehicleToMercadoLibre::dispatch(
            $vehicle->id,
            $vehicle->store_id,
            'updated'
        );

        $store = $vehicle->store;
        if ($store && ! empty($store->whatsapp_catalog_id)) {
            SyncVehicleToWhatsApp::dispatch(
                $vehicle->id,
                $vehicle->store_id,
                'updated'
            );
        }
    }

    /**
     * Handle the Vehicle "deleted" event.
     */
    public function deleted(Vehicle $vehicle): void
    {
        SyncVehicleToMercadoLibre::dispatch(
            $vehicle->id,
            $vehicle->store_id,
            'deleted',
            $vehicle->mercadolibre_id
        );

        if (! empty($vehicle->whatsapp_id)) {
            SyncVehicleToWhatsApp::dispatch(
                $vehicle->id,
                $vehicle->store_id,
                'deleted',
                $vehicle->whatsapp_id
            );
        }
    }
}
