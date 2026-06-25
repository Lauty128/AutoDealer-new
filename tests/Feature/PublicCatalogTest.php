<?php

use App\Models\Plan;
use App\Models\Store;
use App\Models\Subscription;
use App\Models\Vehicle;
use App\Models\VehicleMark;
use App\Models\VehicleType;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('public catalog lists vehicles and allows filter options without authentication', function () {
    $plan = Plan::create([
        'name' => 'Plan Premium',
        'slug' => 'premium',
        'price' => 4500,
        'currency' => 'ARS',
        'billing_period' => 'monthly',
        'trial_days' => 90,
    ]);

    $store = Store::create([
        'name' => 'Auto Showroom Norte',
        'slug' => 'norte',
        'phone' => '123456789',
        'presentation' => 'El mejor concesionario de la zona norte.',
    ]);

    Subscription::create([
        'store_id' => $store->id,
        'plan_id' => $plan->id,
        'status' => 'trialing',
        'trial_ends_at' => now()->addDays(90),
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
    $response = $this->get('/concesionario/'.$store->id);
    $response->assertStatus(200);
    $response->assertSee('Auto Showroom Norte');
    $response->assertSee('href="'.asset('favicon.ico').'"', false);
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
    $plan = Plan::create([
        'name' => 'Plan Premium',
        'slug' => 'premium',
        'price' => 4500,
        'currency' => 'ARS',
        'billing_period' => 'monthly',
        'trial_days' => 90,
    ]);

    $store = Store::create([
        'name' => 'Auto Showroom Norte',
        'slug' => 'norte',
        'phone' => '123456789',
        'logo' => 'https://example.com/logo.png',
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

    $vehicle->details()->create([
        'label' => 'Techo Solar',
        'value' => 'Panorámico corredizo',
    ]);

    $response = $this->get('/concesionario/norte/'.$vehicle->slug);
    $response->assertStatus(200);

    // Verify fallback using numeric ID still works
    $responseFallback = $this->get('/concesionario/'.$store->id.'/'.$vehicle->id);
    $responseFallback->assertStatus(200);
    $response->assertSee('<link rel="icon" type="image/*" href="https://example.com/logo.png">', false);

    // Verify view content
    $response->assertSee('RAV4 Hybrid');
    $response->assertSee('45.000');
    $response->assertSee('12.000 km');
    $response->assertSee('nafta');
    $response->assertSee('2.5L Hybrid');
    $response->assertSee('Un vehículo increíble en excelente estado.');
    $response->assertSee('Techo Solar');
    $response->assertSee('Panorámico corredizo');

    // Verify SEO Meta Tags are present in the HTML (Server-Side Rendered)
    $response->assertSee('<meta name="description" content="Ficha técnica de Toyota RAV4 Hybrid año 2022. Kilometraje: 12.000 km. Combustible: nafta. Precio: US$ 45.000 en Auto Showroom Norte.">', false);
    $response->assertSee('<meta property="og:title" content="Toyota RAV4 Hybrid (2022)">', false);
    $response->assertSee('<meta property="og:url" content="'.url('/concesionario/norte/'.$vehicle->slug).'">', false);
});

test('returns 404 for non-existent store or vehicle', function () {
    // Non-existent store gives 404
    $this->get('/concesionario/non-existent-store')->assertStatus(404);

    $plan = Plan::create([
        'name' => 'Plan Premium',
        'slug' => 'premium',
        'price' => 4500,
        'currency' => 'ARS',
        'billing_period' => 'monthly',
        'trial_days' => 90,
    ]);

    $store = Store::create([
        'name' => 'Auto Showroom Norte',
        'slug' => 'norte',
    ]);

    Subscription::create([
        'store_id' => $store->id,
        'plan_id' => $plan->id,
        'status' => 'trialing',
        'trial_ends_at' => now()->addDays(90),
    ]);

    // Valid store but non-existent vehicle gives 404
    $this->get('/concesionario/norte/9999')->assertStatus(404);
});

test('public catalog displays store city and province and converts USD price when store currency is ARS', function () {
    $plan = Plan::create([
        'name' => 'Plan Premium',
        'slug' => 'premium',
        'price' => 4500,
        'currency' => 'ARS',
        'billing_period' => 'monthly',
        'trial_days' => 90,
    ]);

    $store = Store::create([
        'name' => 'Auto Showroom Oeste',
        'slug' => 'oeste',
        'phone' => '123456789',
        'province' => 'Mendoza',
        'city' => 'San Rafael',
        'address' => 'Av. Mitre 500',
        'currency' => 'ARS',
        'usd_exchange_rate' => 1000.00,
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
        'model' => 'RAV4',
        'year' => 2022,
        'price' => 15000, // USD 15,000
        'status' => 'available',
        'currency' => 'USD',
    ]);

    // Request the catalog index
    $response = $this->get('/concesionario/oeste');
    $response->assertStatus(200);

    // Verify address with city and province is displayed on banner
    $response->assertSee('Av. Mitre 500, San Rafael, Mendoza');

    // Verify USD price and the converted ARS price ($ 15.000.000) is displayed
    $response->assertSee('US$ 15.000');
    $response->assertSee('($ 15.000.000)');

    // Request the vehicle details view using slug
    $responseDetail = $this->get('/concesionario/oeste/'.$vehicle->slug);
    $responseDetail->assertStatus(200);
    $responseDetail->assertSee('US$ 15.000');
    $responseDetail->assertSee('($ 15.000.000)');
});

test('privacy policy page is accessible publicly and contains meta data deletion instructions', function () {
    $response = $this->get('/politicas-de-privacidad');

    $response->assertStatus(200);
    $response->assertSee('Políticas de Privacidad y Condiciones de Uso');
    $response->assertSee('Eliminación de Datos de Meta y Facebook');
    $response->assertSee('administracion@autodealer.com.ar');
});
