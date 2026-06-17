<?php

use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('admin login page can be rendered', function () {
    $response = $this->get('/admin/login');

    $response->assertStatus(200);
});

test('guest is redirected to admin login', function () {
    $response = $this->get('/admin/dashboard');

    $response->assertRedirect('/admin/login');
});

test('non-superadmin is redirected and logged out', function () {
    $user = User::factory()->create([
        'is_superadmin' => false,
    ]);

    $response = $this->actingAs($user)->get('/admin/dashboard');

    $this->assertGuest();
    $response->assertRedirect('/admin/login');
});

test('superadmin can access dashboard', function () {
    $user = User::factory()->create([
        'is_superadmin' => true,
    ]);

    $response = $this->actingAs($user)->get('/admin/dashboard');

    $response->assertStatus(250) // Inertia returns 200 or 250 in tests depending on headers, but standard Laravel assertStatus(200) works
        ->assertStatus(200);
});

test('superadmin can authenticate using admin login screen', function () {
    $user = User::factory()->create([
        'is_superadmin' => true,
    ]);

    $response = $this->post('/admin/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('admin.dashboard', absolute: false));
});

test('non-superadmin cannot authenticate using admin login screen', function () {
    $user = User::factory()->create([
        'is_superadmin' => false,
    ]);

    $response = $this->post('/admin/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertGuest();
});

test('guest is redirected to admin login from store templates', function () {
    $store = Store::create([
        'name' => 'Store Test',
        'slug' => 'store-test',
    ]);

    $response = $this->get("/admin/stores/{$store->id}/templates");

    $response->assertRedirect('/admin/login');
});

test('non-superadmin is redirected and logged out from store templates', function () {
    $store = Store::create([
        'name' => 'Store Test',
        'slug' => 'store-test',
    ]);
    $user = User::factory()->create([
        'is_superadmin' => false,
    ]);

    $response = $this->actingAs($user)->get("/admin/stores/{$store->id}/templates");

    $this->assertGuest();
    $response->assertRedirect('/admin/login');
});

test('superadmin can access store templates page', function () {
    $store = Store::create([
        'name' => 'Store Test',
        'slug' => 'store-test',
    ]);
    $user = User::factory()->create([
        'is_superadmin' => true,
    ]);

    $response = $this->actingAs($user)->get("/admin/stores/{$store->id}/templates");

    $response->assertStatus(200);
});
