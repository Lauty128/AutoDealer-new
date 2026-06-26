<?php

use App\Models\Plan;
use App\Models\Store;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

test('store settings page can be rendered for store owner', function () {
    $user = User::factory()->create();
    $store = Store::create([
        'name' => 'My Concessionaire',
        'slug' => 'my-concessionaire',
        'phone' => '123456',
    ]);

    // Attach store with role owner
    $user->stores()->attach($store->id, ['role' => 'owner']);

    // Create a plan and subscription (since subscribed middleware is active for store settings routes)
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
        'status' => 'active',
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('store.settings.edit', ['store_id' => $store->id]));

    $response->assertOk();
});

test('store settings can be updated by owner but WhatsApp Meta credentials remain unchanged', function () {
    $user = User::factory()->create();
    $store = Store::create([
        'name' => 'My Concessionaire',
        'slug' => 'my-concessionaire',
        'phone' => '123456',
        'currency' => 'USD',
        'usd_exchange_rate' => 1.00,
        'whatsapp_phone_number_id' => 'ORIGINAL-PHONE-ID',
    ]);

    $user->stores()->attach($store->id, ['role' => 'owner']);

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
        'status' => 'active',
    ]);

    $response = $this
        ->actingAs($user)
        ->post(route('store.settings.update'), [
            'id' => $store->id,
            'name' => 'Updated Concessionaire Name',
            'slug' => 'my-concessionaire',
            'phone' => '123456',
            'currency' => 'USD',
            'usd_exchange_rate' => 1.00,
            // Try to maliciously hijack or configure phone number id
            'whatsapp_phone_number_id' => 'HIJACKED-PHONE-ID',
        ]);

    $response->assertRedirect(route('store.settings.edit', ['store_id' => $store->id]));
    $response->assertSessionHasNoErrors();

    $store->refresh();
    expect($store->name)->toBe('Updated Concessionaire Name');
    // Meta credentials must not have changed because they are not validated/saved in StoreController
    expect($store->whatsapp_phone_number_id)->toBe('ORIGINAL-PHONE-ID');
});

test('superadmin can update store Meta integration settings from admin panel', function () {
    $admin = User::factory()->create([
        'is_superadmin' => true,
    ]);

    $store = Store::create([
        'name' => 'My Concessionaire',
        'slug' => 'my-concessionaire',
        'phone' => '123456',
    ]);

    $response = $this
        ->actingAs($admin)
        ->post(route('admin.stores.update', ['id' => $store->id]), [
            'name' => 'Updated by Admin',
            'slug' => 'my-concessionaire',
            'phone' => '123456',
            'whatsapp_phone_number_id' => 'ADMIN-SET-PHONE-ID',
        ]);

    $response->assertRedirect(route('admin.stores.index'));
    $response->assertSessionHasNoErrors();

    $store->refresh();
    expect($store->name)->toBe('Updated by Admin');
    expect($store->whatsapp_phone_number_id)->toBe('ADMIN-SET-PHONE-ID');
});

test('superadmin can request WhatsApp verification code successfully', function () {
    $admin = User::factory()->create([
        'is_superadmin' => true,
    ]);

    $store = Store::create([
        'name' => 'My Concessionaire',
        'slug' => 'my-concessionaire',
        'phone' => '123456',
    ]);

    // Mock access token
    config(['services.meta.access_token' => 'mocked-access-token']);

    Http::fake([
        'https://graph.facebook.com/v18.0/123456789/request_code' => Http::response(['success' => true], 200),
    ]);

    $response = $this
        ->actingAs($admin)
        ->postJson(route('admin.stores.whatsapp.requestCode', ['id' => $store->id]), [
            'whatsapp_phone_number_id' => '123456789',
            'code_method' => 'SMS',
        ]);

    $response->assertOk()
        ->assertJson([
            'status' => 'success',
            'message' => 'Código de verificación solicitado con éxito.',
        ]);

    $store->refresh();
    expect($store->whatsapp_phone_number_id)->toBe('123456789');
});

test('superadmin request WhatsApp verification code returns error on Meta failure', function () {
    $admin = User::factory()->create([
        'is_superadmin' => true,
    ]);

    $store = Store::create([
        'name' => 'My Concessionaire',
        'slug' => 'my-concessionaire',
        'phone' => '123456',
    ]);

    config(['services.meta.access_token' => 'mocked-access-token']);

    Http::fake([
        'https://graph.facebook.com/v18.0/123456789/request_code' => Http::response([
            'error' => [
                'message' => 'Invalid phone number ID',
            ]
        ], 400),
    ]);

    $response = $this
        ->actingAs($admin)
        ->postJson(route('admin.stores.whatsapp.requestCode', ['id' => $store->id]), [
            'whatsapp_phone_number_id' => '123456789',
            'code_method' => 'SMS',
        ]);

    $response->assertStatus(422)
        ->assertJson([
            'status' => 'error',
            'message' => 'Invalid phone number ID',
        ]);
});

test('superadmin can verify OTP, register phone, create catalog and link it successfully', function () {
    $admin = User::factory()->create([
        'is_superadmin' => true,
    ]);

    $store = Store::create([
        'name' => 'My Concessionaire',
        'slug' => 'my-concessionaire',
        'phone' => '123456',
    ]);

    config([
        'services.meta.access_token' => 'mocked-access-token',
        'services.meta.waba_id' => 'mocked-waba-id',
        'services.meta.business_id' => 'mocked-business-id',
    ]);

    Http::fake([
        'https://graph.facebook.com/v18.0/123456789/verify_code' => Http::response(['success' => true], 200),
        'https://graph.facebook.com/v18.0/123456789/register' => Http::response(['success' => true], 200),
        'https://graph.facebook.com/v18.0/mocked-business-id/owned_product_catalogs' => Http::response(['id' => 'mocked-catalog-id'], 200),
        'https://graph.facebook.com/v18.0/mocked-waba-id/product_catalogs' => Http::response(['success' => true], 200),
    ]);

    $response = $this
        ->actingAs($admin)
        ->postJson(route('admin.stores.whatsapp.verifyRegister', ['id' => $store->id]), [
            'whatsapp_phone_number_id' => '123456789',
            'code' => '123456',
            'pin' => '654321',
        ]);

    $response->assertOk()
        ->assertJson([
            'status' => 'success',
            'message' => 'Configuración de WhatsApp completada con éxito. Catálogo creado y enlazado.',
            'whatsapp_phone_number_id' => '123456789',
            'whatsapp_catalog_id' => 'mocked-catalog-id',
        ]);

    $store->refresh();
    expect($store->whatsapp_phone_number_id)->toBe('123456789');
    expect($store->whatsapp_catalog_id)->toBe('mocked-catalog-id');
});

