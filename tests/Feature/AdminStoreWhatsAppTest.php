<?php

namespace Tests\Feature;

use App\Models\Plan;
use App\Models\Store;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('superadmin can update store whatsapp catalog fields', function () {
    $superadmin = User::factory()->create([
        'is_superadmin' => true,
    ]);

    $store = Store::create([
        'name' => 'Concesionario Test',
        'slug' => 'concesionario-test',
    ]);

    $response = $this->actingAs($superadmin)
        ->post(route('admin.stores.update', ['id' => $store->id]), [
            'name' => 'Concesionario Test Updated',
            'slug' => 'concesionario-test',
            'whatsapp_catalog_id' => 'catalog_123',
            'whatsapp_catalog_phone' => '+54 9 11 1234 5678',
        ]);

    $response->assertRedirect(route('admin.stores.index'));

    $store->refresh();
    expect($store->name)->toBe('Concesionario Test Updated');
    expect($store->whatsapp_catalog_id)->toBe('catalog_123');
    expect($store->whatsapp_catalog_phone)->toBe('+54 9 11 1234 5678');
});

test('client cannot update store whatsapp catalog fields via store settings page', function () {
    $user = User::factory()->create([
        'is_superadmin' => false,
    ]);

    $store = Store::create([
        'name' => 'Concesionario Test',
        'slug' => 'concesionario-test',
        'currency' => 'USD',
        'usd_exchange_rate' => 1000.00,
        'whatsapp_catalog_id' => 'catalog_admin_set',
    ]);

    $plan = Plan::create([
        'name' => 'Plan Premium',
        'slug' => 'premium',
        'price' => 4500,
        'currency' => 'ARS',
        'billing_period' => 'monthly',
        'trial_days' => 90,
    ]);

    Subscription::create([
        'store_id' => $store->id,
        'plan_id' => $plan->id,
        'status' => 'trialing',
        'trial_ends_at' => now()->addDays(90),
    ]);

    $user->stores()->attach($store->id, ['role' => 'owner']);

    $response = $this->actingAs($user)
        ->post(route('store.settings.update'), [
            'id' => $store->id,
            'name' => 'Client Renamed Store',
            'slug' => 'concesionario-test',
            'currency' => 'USD',
            'usd_exchange_rate' => 1000.00,
            // Try to override fields:
            'whatsapp_catalog_id' => 'client_hack_catalog',
        ]);

    $response->assertRedirect(route('store.settings.edit', ['store_id' => $store->id]));

    $store->refresh();
    expect($store->name)->toBe('Client Renamed Store');
    // Ensure admin set fields remain intact
    expect($store->whatsapp_catalog_id)->toBe('catalog_admin_set');
});

test('client store settings page passes correct support url', function () {
    $user = User::factory()->create([
        'is_superadmin' => false,
    ]);

    $store = Store::create([
        'name' => 'Concesionario Test',
        'slug' => 'concesionario-test',
    ]);

    $plan = Plan::create([
        'name' => 'Plan Premium',
        'slug' => 'premium',
        'price' => 4500,
        'currency' => 'ARS',
        'billing_period' => 'monthly',
        'trial_days' => 90,
    ]);

    Subscription::create([
        'store_id' => $store->id,
        'plan_id' => $plan->id,
        'status' => 'trialing',
        'trial_ends_at' => now()->addDays(90),
    ]);

    $user->stores()->attach($store->id, ['role' => 'owner']);

    // Set configuration variables explicitly
    config(['services.whatsapp.support_phone' => '5491134567890']);
    config(['services.whatsapp.activation_message' => 'Activar {store_name} (ID: {store_id})']);

    $response = $this->actingAs($user)
        ->get(route('store.settings.edit', ['store_id' => $store->id]));

    $response->assertStatus(200);

    // Verify Inertia shared props or page has the correct prop
    $inertiaPage = $response->original->getData()['page'];
    expect($inertiaPage['props']['whatsappSupportUrl'])->toBe(
        'https://wa.me/5491134567890?text='.urlencode("Activar Concesionario Test (ID: {$store->id})")
    );
});
