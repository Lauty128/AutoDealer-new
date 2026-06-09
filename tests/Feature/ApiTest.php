<?php

use App\Models\User;
use App\Models\Store;
use App\Models\VehicleType;
use App\Models\VehicleMark;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('user can log in via api', function () {
    $user = User::create([
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => Hash::make('secret123'),
    ]);

    $response = $this->postJson('/api/login', [
        'email' => 'john@example.com',
        'password' => 'secret123',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'user' => ['id', 'name', 'email'],
            'token',
        ]);
});

test('login fails with invalid credentials', function () {
    $user = User::create([
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => Hash::make('secret123'),
    ]);

    $response = $this->postJson('/api/login', [
        'email' => 'john@example.com',
        'password' => 'wrongpassword',
    ]);

    $response->assertStatus(401)
        ->assertJson([
            'message' => 'Las credenciales proporcionadas son incorrectas.',
        ]);
});

test('authenticated user can list vehicles from their stores', function () {
    // Create users
    $user = User::create([
        'name' => 'Authorized User',
        'email' => 'auth@example.com',
        'password' => Hash::make('password'),
    ]);

    $otherUser = User::create([
        'name' => 'Other User',
        'email' => 'other@example.com',
        'password' => Hash::make('password'),
    ]);

    // Create stores
    $store = Store::create([
        'name' => 'My Store',
        'slug' => 'my-store',
    ]);

    $otherStore = Store::create([
        'name' => 'Other Store',
        'slug' => 'other-store',
    ]);

    // Associate user with $store
    $user->stores()->attach($store->id, ['role' => 'owner']);
    // Associate otherUser with $otherStore
    $otherUser->stores()->attach($otherStore->id, ['role' => 'owner']);

    // Create types and marks
    $type = VehicleType::create(['name' => 'Car', 'slug' => 'car']);
    $mark = VehicleMark::create(['name' => 'Toyota', 'slug' => 'toyota']);

    // Create vehicles
    $myVehicle = Vehicle::create([
        'store_id' => $store->id,
        'vehicle_type_id' => $type->id,
        'vehicle_mark_id' => $mark->id,
        'model' => 'Corolla',
        'year' => 2020,
        'price' => 20000,
        'status' => 'available',
    ]);

    $otherVehicle = Vehicle::create([
        'store_id' => $otherStore->id,
        'vehicle_type_id' => $type->id,
        'vehicle_mark_id' => $mark->id,
        'model' => 'Camry',
        'year' => 2021,
        'price' => 30000,
        'status' => 'available',
    ]);

    // Request without token should fail
    $this->getJson('/api/vehicles')
        ->assertStatus(401);

    // Request with token
    $token = $user->createToken('test-token')->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->getJson('/api/vehicles');

    $response->assertStatus(200)
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.model', 'Corolla');
});
