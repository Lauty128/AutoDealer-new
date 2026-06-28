<?php

namespace Tests\Feature;

use App\Models\Plan;
use App\Models\Store;
use App\Models\Subscription;
use App\Models\User;
use App\Services\MetaApiService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery\MockInterface;

uses(RefreshDatabase::class);

/**
 * Helper to create store with active subscription to bypass the 'subscribed' middleware.
 */
function createStoreWithSubscription(array $attributes = []): Store
{
    $store = Store::create(array_merge([
        'name' => 'Test Dealer',
        'slug' => 'test-dealer',
    ], $attributes));

    $plan = Plan::firstOrCreate(
        ['slug' => 'premium'],
        [
            'name' => 'Plan Premium',
            'price' => 4500,
            'currency' => 'ARS',
            'billing_period' => 'monthly',
            'trial_days' => 90,
        ]
    );

    Subscription::create([
        'store_id' => $store->id,
        'plan_id' => $plan->id,
        'status' => 'trialing',
        'trial_ends_at' => now()->addDays(90),
    ]);

    return $store;
}

test('user can redirect to meta oauth connect url', function () {
    $user = User::factory()->create();
    $store = createStoreWithSubscription();
    $user->stores()->attach($store->id, ['role' => 'owner']);

    $this->mock(MetaApiService::class, function (MockInterface $mock) {
        $mock->shouldReceive('getAuthUrl')
            ->once()
            ->andReturn('https://www.facebook.com/v20.0/dialog/oauth?client_id=123');
    });

    $response = $this->actingAs($user)
        ->get(route('settings.whatsapp.connect', ['store_id' => $store->id]));

    $response->assertRedirect('https://www.facebook.com/v20.0/dialog/oauth?client_id=123');
});

test('user cannot connect store they do not own or manage', function () {
    $user = User::factory()->create();
    $store = createStoreWithSubscription();
    // Attached as employee
    $user->stores()->attach($store->id, ['role' => 'employee']);

    $response = $this->actingAs($user)
        ->get(route('settings.whatsapp.connect', ['store_id' => $store->id]));

    $response->assertStatus(403);
});

test('meta oauth callback exchanges code and saves access token', function () {
    $user = User::factory()->create();
    $store = createStoreWithSubscription();
    $user->stores()->attach($store->id, ['role' => 'owner']);

    $this->mock(MetaApiService::class, function (MockInterface $mock) {
        $mock->shouldReceive('exchangeCodeForToken')
            ->once()
            ->with('auth_code_123', route('settings.whatsapp.callback'))
            ->andReturn('long_lived_token_xyz');
    });

    $response = $this->actingAs($user)
        ->get(route('settings.whatsapp.callback', [
            'code' => 'auth_code_123',
            'state' => $store->id,
        ]));

    $response->assertRedirect(route('store.settings.edit', ['store_id' => $store->id]));
    $response->assertSessionHas('status', 'success');

    $store->refresh();
    expect($store->whatsapp_access_token)->toBe('long_lived_token_xyz');
});

test('user can select catalog and save it', function () {
    $user = User::factory()->create();
    $store = createStoreWithSubscription([
        'whatsapp_access_token' => 'token_xyz',
    ]);
    $user->stores()->attach($store->id, ['role' => 'owner']);

    $response = $this->actingAs($user)
        ->post(route('settings.whatsapp.select-catalog'), [
            'store_id' => $store->id,
            'whatsapp_catalog_id' => 'catalog_999',
            'whatsapp_catalog_phone' => '+54 9 11 9999 9999',
        ]);

    $response->assertRedirect(route('store.settings.edit', ['store_id' => $store->id]));

    $store->refresh();
    expect($store->whatsapp_catalog_id)->toBe('catalog_999');
    expect($store->whatsapp_catalog_phone)->toBe('+54 9 11 9999 9999');
});

test('user can disconnect their meta account', function () {
    $user = User::factory()->create();
    $store = createStoreWithSubscription([
        'whatsapp_access_token' => 'token_xyz',
        'whatsapp_catalog_id' => 'catalog_999',
    ]);
    $user->stores()->attach($store->id, ['role' => 'owner']);

    $response = $this->actingAs($user)
        ->post(route('settings.whatsapp.disconnect'), [
            'store_id' => $store->id,
        ]);

    $response->assertRedirect(route('store.settings.edit', ['store_id' => $store->id]));

    $store->refresh();
    expect($store->whatsapp_access_token)->toBeNull();
    expect($store->whatsapp_catalog_id)->toBeNull();
});

test('user can trigger full stock synchronization', function () {
    $user = User::factory()->create();
    $store = createStoreWithSubscription([
        'whatsapp_access_token' => 'token_xyz',
        'whatsapp_catalog_id' => 'catalog_999',
    ]);
    $user->stores()->attach($store->id, ['role' => 'owner']);

    $this->mock(MetaApiService::class, function (MockInterface $mock) {
        $mock->shouldReceive('withToken')
            ->once()
            ->with('token_xyz')
            ->andReturnSelf();
        $mock->shouldReceive('syncAllVehicles')
            ->once()
            ->andReturn(3);
    });

    $response = $this->actingAs($user)
        ->post(route('settings.whatsapp.sync-full'), [
            'store_id' => $store->id,
        ]);

    $response->assertRedirect(route('store.settings.edit', ['store_id' => $store->id]));
    $response->assertSessionHas('status', 'success');
});
