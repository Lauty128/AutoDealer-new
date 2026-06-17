<?php

use App\Models\Store;
use App\Models\Vehicle;
use App\Models\VehicleMark;
use App\Models\VehicleType;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('public catalog lists vehicles and allows filter options without authentication', function () {
    $store = Store::create([
        'name' => 'Auto Showroom Norte',
        'slug' => 'norte',
        'phone' => '123456789',
        'presentation' => 'El mejor concesionario de la zona norte.',
    ]);

    $type = VehicleType::create(['name' => 'SUV', 'slug' => 'suv']);
    $mark = VehicleMark::create(['name' => 'Toyota', 'slug' => 'toyota']);

    $vehicle1 = Vehicle::create([
        'store_id' => $store->id,
        'vehicle_type_id' => $type->id,
        'vehicle_mark_id' => $mark->id,
        'model' => 'RAV4',
        'year' => 2022,
        'price' => 45000,
        'status' => 'available',
        'currency' => 'USD',
        'mileage' => 12000,
        'fuel_type' => 'híbrido',
    ]);

    $vehicle2 = Vehicle::create([
        'store_id' => $store->id,
        'vehicle_type_id' => $type->id,
        'vehicle_mark_id' => $mark->id,
        'model' => 'SW4',
        'year' => 2021,
        'price' => 55000,
        'status' => 'reserved',
        'currency' => 'USD',
        'mileage' => 24000,
        'fuel_type' => 'diesel',
    ]);

    // Request using Store ID
    $response = $this->get('/concesionario/' . $store->id);
    $response->assertStatus(200);
    $response->assertSee('Auto Showroom Norte');
    $response->assertSee('El mejor concesionario de la zona norte.');
    $response->assertSee('RAV4');
    $response->assertSee('SW4');
    $response->assertSee('Disponible');
    $response->assertSee('Reservado');

    // Request using Store Slug
    $responseSlug = $this->get('/concesionario/norte');
    $responseSlug->assertStatus(200);
    $responseSlug->assertSee('RAV4');

    // Test search filter
    $responseSearch = $this->get('/concesionario/norte?search=RAV4');
    $responseSearch->assertStatus(200);
    $responseSearch->assertSee('RAV4');
    $responseSearch->assertDontSee('SW4');
});

test('public vehicle details displays specific vehicle information and SEO tags', function () {
    $store = Store::create([
        'name' => 'Auto Showroom Norte',
        'slug' => 'norte',
        'phone' => '123456789',
    ]);

    $type = VehicleType::create(['name' => 'SUV', 'slug' => 'suv']);
    $mark = VehicleMark::create(['name' => 'Toyota', 'slug' => 'toyota']);

    $vehicle = Vehicle::create([
        'store_id' => $store->id,
        'vehicle_type_id' => $type->id,
        'vehicle_mark_id' => $mark->id,
        'model' => 'RAV4 Hybrid',
        'year' => 2022,
        'price' => 45000,
        'status' => 'available',
        'currency' => 'USD',
        'mileage' => 12000,
        'fuel_type' => 'nafta',
        'description' => 'Un vehículo increíble en excelente estado.',
        'engine' => '2.5L Hybrid',
    ]);

    $response = $this->get('/concesionario/norte/' . $vehicle->id);
    $response->assertStatus(200);

    // Verify view content
    $response->assertSee('RAV4 Hybrid');
    $response->assertSee('45.000');
    $response->assertSee('12.000 km');
    $response->assertSee('nafta');
    $response->assertSee('2.5L Hybrid');
    $response->assertSee('Un vehículo increíble en excelente estado.');

    // Verify SEO Meta Tags are present in the HTML (Server-Side Rendered)
    $response->assertSee('<meta name="description" content="Ficha técnica de Toyota RAV4 Hybrid año 2022. Kilometraje: 12.000 km. Combustible: nafta. Precio: US$ 45.000 en Auto Showroom Norte.">', false);
    $response->assertSee('<meta property="og:title" content="Toyota RAV4 Hybrid (2022)">', false);
    $response->assertSee('<meta property="og:url" content="' . url()->current() . '">', false);
});

test('returns 404 for non-existent store or vehicle', function () {
    $this->get('/concesionario/non-existent-store')->assertStatus(404);

    $store = Store::create([
        'name' => 'Auto Showroom Norte',
        'slug' => 'norte',
    ]);

    $this->get('/concesionario/norte/9999')->assertStatus(404);
});
