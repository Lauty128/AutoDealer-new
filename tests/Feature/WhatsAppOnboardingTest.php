<?php

use App\Models\Plan;
use App\Models\Store;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

function createStoreWithOwner(string $storeName = 'My Concessionaire'): array
{
    $user = User::factory()->create();
    $store = Store::create([
        'name' => $storeName,
        'slug' => Str::slug($storeName),
        'phone' => '123456',
    ]);

    // Attach store with role owner
    $user->stores()->attach($store->id, ['role' => 'owner']);

    // Create a plan and subscription
    $plan = Plan::create([
        'name' => 'Plan Premium',
        'slug' => 'premium',
        'price' => 4500,
        'currency' => 'ARS',
        'billing_period' => 'monthly',
        'trial_days' => 90,
    ]);

    $subscription = Subscription::create([
        'store_id' => $store->id,
        'plan_id' => $plan->id,
        'status' => 'active',
    ]);

    return [$user, $store];
}

test('whatsapp onboarding page can be rendered for store owner', function () {
    [$user, $store] = createStoreWithOwner();

    config([
        'services.meta.client_id' => '123456789',
        'services.meta.client_secret' => 'secret-key',
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('store.whatsapp.onboarding'));

    $response->assertOk();
    $response->assertSee('Configuración de Catálogo de WhatsApp');
    $response->assertSee('Conectar con Facebook');
});

test('whatsapp onboarding page is forbidden for non-owner/manager user', function () {
    [$user, $store] = createStoreWithOwner();

    // Create another user not associated with the store
    $otherUser = User::factory()->create();

    $response = $this
        ->actingAs($otherUser)
        ->get(route('store.whatsapp.onboarding'));

    $response->assertStatus(403);
});

test('whatsapp callback handles state parsing and user mismatch correctly', function () {
    [$user, $store] = createStoreWithOwner();
    $otherUser = User::factory()->create();

    // Valid state for user
    $state = encrypt([
        'store_id' => $store->id,
        'user_id' => $user->id,
    ]);

    // Attempting callback with wrong user authenticated
    $response = $this
        ->actingAs($otherUser)
        ->get(route('store.whatsapp.callback', [
            'code' => 'auth-code',
            'state' => $state,
        ]));

    $response->assertStatus(403);
});

test('whatsapp callback successfully exchanges token, gets business, lists catalogs and renders select catalog view', function () {
    [$user, $store] = createStoreWithOwner();

    config([
        'services.meta.client_id' => '123456789',
        'services.meta.client_secret' => 'secret-key',
    ]);

    $state = encrypt([
        'store_id' => $store->id,
        'user_id' => $user->id,
    ]);

    Http::fake([
        'https://graph.facebook.com/v19.0/oauth/access_token*' => Http::response([
            'access_token' => 'meta-user-access-token',
        ], 200),
        'https://graph.facebook.com/v19.0/me/businesses' => Http::response([
            'data' => [
                ['id' => 'meta-business-id-123', 'name' => 'Concessionaire Business'],
            ],
        ], 200),
        'https://graph.facebook.com/v19.0/meta-business-id-123/owned_product_catalogs' => Http::response([
            'data' => [
                ['id' => 'catalog-id-abc', 'name' => 'Cars Catalog', 'vertical' => 'COMMERCE'],
            ],
        ], 200),
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('store.whatsapp.callback', [
            'code' => 'valid-code-from-meta',
            'state' => $state,
        ]));

    $response->assertOk();
    $response->assertSee('Selecciona tu Catálogo de Productos');
    $response->assertSee('Cars Catalog');
    $response->assertSee('catalog-id-abc');

    $store->refresh();
    expect($store->whatsapp_access_token)->toBe('meta-user-access-token');
    expect($store->whatsapp_business_id)->toBe('meta-business-id-123');
});

test('whatsapp callback automatically creates a catalog and completes onboarding if no catalogs exist', function () {
    [$user, $store] = createStoreWithOwner('AutoDealer Store');

    config([
        'services.meta.client_id' => '123456789',
        'services.meta.client_secret' => 'secret-key',
    ]);

    $state = encrypt([
        'store_id' => $store->id,
        'user_id' => $user->id,
    ]);

    Http::fake([
        'https://graph.facebook.com/v19.0/oauth/access_token*' => Http::response([
            'access_token' => 'meta-user-access-token',
        ], 200),
        'https://graph.facebook.com/v19.0/me/businesses' => Http::response([
            'data' => [
                ['id' => 'meta-business-id-123', 'name' => 'Concessionaire Business'],
            ],
        ], 200),
        'https://graph.facebook.com/v19.0/meta-business-id-123/owned_product_catalogs' => Http::sequence()
            ->push(['data' => []], 200) // First search GET
            ->push(['id' => 'new-created-catalog-id'], 200), // Create POST
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('store.whatsapp.callback', [
            'code' => 'valid-code-from-meta',
            'state' => $state,
        ]));

    $response->assertRedirect(route('store.whatsapp.onboarding'));
    $response->assertSessionHas('status', 'success');
    $response->assertSessionHas('message', '¡Integración exitosa! No se encontraron catálogos existentes, por lo que creamos uno nuevo llamado "AutoDealer - AutoDealer Store" automáticamente.');

    $store->refresh();
    expect($store->whatsapp_access_token)->toBe('meta-user-access-token');
    expect($store->whatsapp_business_id)->toBe('meta-business-id-123');
    expect($store->whatsapp_catalog_id)->toBe('new-created-catalog-id');
});

test('whatsapp callback handles Meta Graph API 400 exceptions gracefully', function () {
    [$user, $store] = createStoreWithOwner();

    config([
        'services.meta.client_id' => '123456789',
        'services.meta.client_secret' => 'secret-key',
    ]);

    $state = encrypt([
        'store_id' => $store->id,
        'user_id' => $user->id,
    ]);

    Http::fake([
        'https://graph.facebook.com/v19.0/oauth/access_token*' => Http::response([
            'error' => [
                'message' => 'This code has expired or is invalid.',
                'type' => 'OAuthException',
                'code' => 100,
            ],
        ], 400),
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('store.whatsapp.callback', [
            'code' => 'expired-code',
            'state' => $state,
        ]));

    $response->assertRedirect(route('store.whatsapp.onboarding'));
    $response->assertSessionHas('status', 'error');
    $response->assertSessionHas('message', 'Error de Meta (400): This code has expired or is invalid.');
});

test('owner can select catalog and complete integration', function () {
    [$user, $store] = createStoreWithOwner();
    $store->update([
        'whatsapp_access_token' => 'existing-token',
        'whatsapp_business_id' => 'business-id-123',
    ]);

    $response = $this
        ->actingAs($user)
        ->post(route('store.whatsapp.selectCatalog'), [
            'catalog_id' => 'catalog-id-xyz',
        ]);

    $response->assertRedirect(route('store.whatsapp.onboarding'));
    $response->assertSessionHas('status', 'success');

    $store->refresh();
    expect($store->whatsapp_catalog_id)->toBe('catalog-id-xyz');
});

test('owner can create a catalog manually through button', function () {
    [$user, $store] = createStoreWithOwner('AutoDealer Store');
    $store->update([
        'whatsapp_access_token' => 'existing-token',
        'whatsapp_business_id' => 'business-id-123',
    ]);

    Http::fake([
        'https://graph.facebook.com/v19.0/business-id-123/owned_product_catalogs' => Http::response([
            'id' => 'newly-created-manually-id',
        ], 200),
    ]);

    $response = $this
        ->actingAs($user)
        ->post(route('store.whatsapp.createCatalog'));

    $response->assertRedirect(route('store.whatsapp.onboarding'));
    $response->assertSessionHas('status', 'success');
    $response->assertSessionHas('message', '¡Catálogo "AutoDealer - AutoDealer Store" creado y vinculado con éxito!');

    $store->refresh();
    expect($store->whatsapp_catalog_id)->toBe('newly-created-manually-id');
});

test('owner can disconnect the integration', function () {
    [$user, $store] = createStoreWithOwner();
    $store->update([
        'whatsapp_access_token' => 'existing-token',
        'whatsapp_business_id' => 'business-id-123',
        'whatsapp_catalog_id' => 'catalog-id-123',
    ]);

    $response = $this
        ->actingAs($user)
        ->post(route('store.whatsapp.disconnect'));

    $response->assertRedirect(route('store.whatsapp.onboarding'));
    $response->assertSessionHas('status', 'success');
    $response->assertSessionHas('message', 'La integración de Catálogo de WhatsApp ha sido desconectada.');

    $store->refresh();
    expect($store->whatsapp_access_token)->toBeNull();
    expect($store->whatsapp_business_id)->toBeNull();
    expect($store->whatsapp_catalog_id)->toBeNull();
});
