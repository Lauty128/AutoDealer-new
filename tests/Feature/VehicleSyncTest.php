<?php

use App\Jobs\SyncVehicleToMercadoLibre;
use App\Jobs\SyncVehicleToWhatsApp;
use App\Models\Plan;
use App\Models\Store;
use App\Models\Subscription;
use App\Models\Vehicle;
use App\Models\VehicleMark;
use App\Models\VehicleType;
use App\Services\MercadoLibreService;
use App\Services\WhatsAppService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

test('creating, updating, and deleting a vehicle dispatches synchronization jobs', function () {
    Queue::fake();

    $plan = Plan::create([
        'name' => 'Plan Premium',
        'slug' => 'premium',
        'price' => 4500,
        'currency' => 'ARS',
        'billing_period' => 'monthly',
        'trial_days' => 90,
    ]);

    $store = Store::create([
        'name' => 'Test Store',
        'slug' => 'test-store',
        'phone' => '123456789',
    ]);

    Subscription::create([
        'store_id' => $store->id,
        'plan_id' => $plan->id,
        'status' => 'trialing',
        'trial_ends_at' => now()->addDays(90),
    ]);

    $type = VehicleType::create(['name' => 'SUV', 'slug' => 'suv']);
    $mark = VehicleMark::create(['name' => 'Toyota', 'slug' => 'toyota']);

    // 1. Test creation dispatches jobs
    $vehicle = Vehicle::create([
        'store_id' => $store->id,
        'vehicle_type_id' => $type->id,
        'vehicle_mark_id' => $mark->id,
        'model' => 'Corolla Cross',
        'year' => 2024,
        'price' => 35000,
        'status' => 'available',
        'currency' => 'USD',
    ]);

    Queue::assertPushed(SyncVehicleToMercadoLibre::class, function ($job) use ($vehicle) {
        return $job->vehicleId === $vehicle->id && $job->action === 'created';
    });

    Queue::assertPushed(SyncVehicleToWhatsApp::class, function ($job) use ($vehicle) {
        return $job->vehicleId === $vehicle->id && $job->action === 'created';
    });

    // 2. Test update dispatches jobs
    $vehicle->update([
        'price' => 34000,
        'mercadolibre_id' => 'MLA-TEST123',
        'whatsapp_id' => 'WA-TEST123',
    ]);

    Queue::assertPushed(SyncVehicleToMercadoLibre::class, function ($job) use ($vehicle) {
        return $job->vehicleId === $vehicle->id && $job->action === 'updated';
    });

    Queue::assertPushed(SyncVehicleToWhatsApp::class, function ($job) use ($vehicle) {
        return $job->vehicleId === $vehicle->id && $job->action === 'updated';
    });

    // 3. Test deletion dispatches jobs
    $vehicleId = $vehicle->id;
    $storeId = $vehicle->store_id;
    $mlId = $vehicle->mercadolibre_id;
    $waId = $vehicle->whatsapp_id;

    $vehicle->delete();

    Queue::assertPushed(SyncVehicleToMercadoLibre::class, function ($job) use ($vehicleId, $storeId, $mlId) {
        return $job->vehicleId === $vehicleId && $job->storeId === $storeId && $job->action === 'deleted' && $job->externalId === $mlId;
    });

    Queue::assertPushed(SyncVehicleToWhatsApp::class, function ($job) use ($vehicleId, $storeId, $waId) {
        return $job->vehicleId === $vehicleId && $job->storeId === $storeId && $job->action === 'deleted' && $job->externalId === $waId;
    });
});

test('SyncVehicleToMercadoLibre job invokes MercadoLibreService correctly on creation', function () {
    $plan = Plan::create([
        'name' => 'Plan Premium',
        'slug' => 'premium',
        'price' => 4500,
        'currency' => 'ARS',
        'billing_period' => 'monthly',
        'trial_days' => 90,
    ]);

    $store = Store::create([
        'name' => 'Test Store',
        'slug' => 'test-store',
        'phone' => '123456789',
    ]);

    Subscription::create([
        'store_id' => $store->id,
        'plan_id' => $plan->id,
        'status' => 'trialing',
        'trial_ends_at' => now()->addDays(90),
    ]);

    $type = VehicleType::create(['name' => 'SUV', 'slug' => 'suv']);
    $mark = VehicleMark::create(['name' => 'Toyota', 'slug' => 'toyota']);

    $vehicle = Vehicle::create([
        'store_id' => $store->id,
        'vehicle_type_id' => $type->id,
        'vehicle_mark_id' => $mark->id,
        'model' => 'Corolla Cross',
        'year' => 2024,
        'price' => 35000,
        'status' => 'available',
        'currency' => 'USD',
    ]);

    $mockService = Mockery::mock(MercadoLibreService::class);
    $mockService->shouldReceive('createListing')
        ->once()
        ->with(Mockery::on(function ($arg) use ($vehicle) {
            return $arg->id === $vehicle->id;
        }))
        ->andReturn('MLA-MOCK123');

    $job = new SyncVehicleToMercadoLibre($vehicle->id, $vehicle->store_id, 'created');
    $job->handle($mockService);

    $vehicle->refresh();
    expect($vehicle->mercadolibre_id)->toBe('MLA-MOCK123');
});

test('SyncVehicleToWhatsApp job invokes WhatsAppService correctly on creation', function () {
    $plan = Plan::create([
        'name' => 'Plan Premium',
        'slug' => 'premium',
        'price' => 4500,
        'currency' => 'ARS',
        'billing_period' => 'monthly',
        'trial_days' => 90,
    ]);

    $store = Store::create([
        'name' => 'Test Store',
        'slug' => 'test-store',
        'phone' => '123456789',
    ]);

    Subscription::create([
        'store_id' => $store->id,
        'plan_id' => $plan->id,
        'status' => 'trialing',
        'trial_ends_at' => now()->addDays(90),
    ]);

    $type = VehicleType::create(['name' => 'SUV', 'slug' => 'suv']);
    $mark = VehicleMark::create(['name' => 'Toyota', 'slug' => 'toyota']);

    $vehicle = Vehicle::create([
        'store_id' => $store->id,
        'vehicle_type_id' => $type->id,
        'vehicle_mark_id' => $mark->id,
        'model' => 'Corolla Cross',
        'year' => 2024,
        'price' => 35000,
        'status' => 'available',
        'currency' => 'USD',
    ]);

    $mockService = Mockery::mock(WhatsAppService::class);
    $mockService->shouldReceive('createCatalogItem')
        ->once()
        ->with(Mockery::on(function ($arg) use ($vehicle) {
            return $arg->id === $vehicle->id;
        }))
        ->andReturn('WA-MOCK123');

    $job = new SyncVehicleToWhatsApp($vehicle->id, $vehicle->store_id, 'created');
    $job->handle($mockService);

    $vehicle->refresh();
    expect($vehicle->whatsapp_id)->toBe('WA-MOCK123');
});
