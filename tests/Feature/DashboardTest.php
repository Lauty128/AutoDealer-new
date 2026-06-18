<?php

use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('authenticated users without stores are redirected to onboarding', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get('/dashboard')->assertRedirect(route('onboarding.store'));
});

test('authenticated users with stores can visit the dashboard', function () {
    $user = User::factory()->create();
    $store = Store::create([
        'name' => 'Auto Dealer Test',
        'slug' => 'test-store',
    ]);
    $user->stores()->attach($store->id, ['role' => 'owner']);

    $this->actingAs($user);

    $this->get('/dashboard')->assertOk();
});

