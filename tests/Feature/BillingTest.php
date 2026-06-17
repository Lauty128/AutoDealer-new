<?php

use App\Models\Plan;
use App\Models\Store;
use App\Models\Subscription;
use App\Models\User;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

test('authenticated manager or owner can visit the billing page', function () {
    $user = User::factory()->create();
    $store = Store::create([
        'name' => 'Auto Dealer Test',
        'slug' => 'test-store',
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

    $subscription = Subscription::create([
        'store_id' => $store->id,
        'plan_id' => $plan->id,
        'status' => 'trialing',
        'trial_ends_at' => now()->addDays(90),
    ]);

    $this->actingAs($user)
        ->get('/dashboard/billing?store_id=' . $store->id)
        ->assertStatus(200)
        ->assertSee('Plan Premium')
        ->assertSee('trialing');
});

test('store with expired subscription redirects manager to billing page', function () {
    $user = User::factory()->create();
    $store = Store::create([
        'name' => 'Auto Dealer Test',
        'slug' => 'test-store',
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

    // Trial expired 5 days ago
    $subscription = Subscription::create([
        'store_id' => $store->id,
        'plan_id' => $plan->id,
        'status' => 'trialing',
        'trial_ends_at' => now()->subDays(5),
    ]);

    $this->actingAs($user)
        ->get('/dashboard/vehicles/manage?store_id=' . $store->id)
        ->assertRedirect('/dashboard/billing?store_id=' . $store->id);
});

test('public catalog is suspended for stores with expired subscription', function () {
    $store = Store::create([
        'name' => 'Auto Dealer Test',
        'slug' => 'test-store',
        'phone' => '112345678',
    ]);

    $plan = Plan::create([
        'name' => 'Plan Premium',
        'slug' => 'premium',
        'price' => 4500,
        'currency' => 'ARS',
        'billing_period' => 'monthly',
        'trial_days' => 90,
    ]);

    // Subscription expired
    Subscription::create([
        'store_id' => $store->id,
        'plan_id' => $plan->id,
        'status' => 'expired',
        'ends_at' => now()->subDays(2),
    ]);

    $this->get('/concesionario/test-store')
        ->assertStatus(403)
        ->assertSee('Catálogo Inactivo')
        ->assertSee('Exhibición Suspendida');
});

test('checkout route generates preference and redirects to MercadoPago', function () {
    Http::fake([
        'api.mercadopago.com/checkout/preferences*' => Http::response([
            'id' => 'pref_123456789',
            'sandbox_init_point' => 'https://sandbox.mercadopago.com/checkout/pref_123456789',
        ], 200),
    ]);

    $user = User::factory()->create();
    $store = Store::create([
        'name' => 'Auto Dealer Test',
        'slug' => 'test-store',
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

    $subscription = Subscription::create([
        'store_id' => $store->id,
        'plan_id' => $plan->id,
        'status' => 'pending_payment',
    ]);

    $response = $this->actingAs($user)
        ->post('/dashboard/billing/checkout', [
            'store_id' => $store->id,
        ], [
            'X-Inertia' => 'true',
        ]);

    // Redirect to MercadoPago checkout link (Inertia::location uses 409 status code with a custom header, or returns a specific response)
    $response->assertStatus(409);
    $response->assertHeader('X-Inertia-Location', 'https://sandbox.mercadopago.com/checkout/pref_123456789');

    // Confirm preference ID was saved
    $subscription->refresh();
    expect($subscription->mercadopago_preference_id)->toBe('pref_123456789');
});

test('webhook approved payment logs transaction and activates subscription', function () {
    $store = Store::create([
        'name' => 'Auto Dealer Test',
        'slug' => 'test-store',
    ]);

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
        'status' => 'expired',
        'ends_at' => now()->subDays(2),
    ]);

    // Mock MercadoPago payment details fetch request
    Http::fake([
        'api.mercadopago.com/v1/payments/*' => Http::response([
            'status' => 'approved',
            'external_reference' => 'sub_' . $subscription->id,
            'transaction_amount' => 4500.00,
            'currency_id' => 'ARS',
            'payment_method_id' => 'credit_card',
            'preference_id' => 'pref_123456789',
        ], 200),
    ]);

    // Send mock POST webhook notification
    $response = $this->postJson('/webhooks/mercadopago', [
        'type' => 'payment',
        'data' => [
            'id' => '9988776655'
        ]
    ]);

    $response->assertStatus(200);

    // Verify database updates
    $subscription->refresh();
    expect($subscription->status)->toBe('active');
    expect($subscription->ends_at->isFuture())->toBeTrue();

    // Verify payment record
    $payment = Payment::where('mercadopago_payment_id', '9988776655')->first();
    expect($payment)->not->toBeNull();
    expect((float)$payment->amount)->toBe(4500.00);
    expect($payment->status)->toBe('approved');
});
