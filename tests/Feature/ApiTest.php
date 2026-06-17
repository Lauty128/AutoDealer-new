<?php

use App\Models\Store;
use App\Models\StoreService;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleMark;
use App\Models\VehicleType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('user can log in via api and receive stores info', function () {
    $user = User::create([
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => Hash::make('secret123'),
    ]);

    $store = Store::create([
        'name' => 'Johns Motors',
        'slug' => 'johns-motors',
    ]);
    $user->stores()->attach($store->id, ['role' => 'owner']);

    $response = $this->postJson('/api/login', [
        'email' => 'john@example.com',
        'password' => 'secret123',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'user' => [
                'id',
                'name',
                'email',
                'stores' => [
                    '*' => ['id', 'name', 'slug'],
                ],
            ],
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

    $store = Store::create([
        'name' => 'My Store',
        'slug' => 'my-store',
    ]);

    $otherStore = Store::create([
        'name' => 'Other Store',
        'slug' => 'other-store',
    ]);

    $user->stores()->attach($store->id, ['role' => 'owner']);
    $otherUser->stores()->attach($otherStore->id, ['role' => 'owner']);

    $type = VehicleType::create(['name' => 'Car', 'slug' => 'car']);
    $mark = VehicleMark::create(['name' => 'Toyota', 'slug' => 'toyota']);

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
        'Authorization' => 'Bearer '.$token,
    ])->getJson('/api/vehicles?store_id='.$store->id);

    $response->assertStatus(200)
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.model', 'Corolla');
});

test('user can verify session and get user profile with stores', function () {
    $user = User::create([
        'name' => 'Alice Session',
        'email' => 'alice@example.com',
        'password' => Hash::make('password'),
    ]);

    $store = Store::create([
        'name' => 'Alice Store',
        'slug' => 'alice-store',
    ]);
    $user->stores()->attach($store->id, ['role' => 'owner']);

    $token = $user->createToken('test-token')->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => 'Bearer '.$token,
    ])->getJson('/api/user');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'user' => [
                'id',
                'name',
                'email',
                'stores' => [
                    '*' => ['id', 'name', 'slug', 'services'],
                ],
            ],
        ]);
});

test('user can list stores they have access to', function () {
    $user = User::create([
        'name' => 'Bob Stores',
        'email' => 'bob@example.com',
        'password' => Hash::make('password'),
    ]);

    $store = Store::create([
        'name' => 'Bob Store',
        'slug' => 'bob-store',
    ]);
    $user->stores()->attach($store->id, ['role' => 'owner']);

    $token = $user->createToken('test-token')->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => 'Bearer '.$token,
    ])->getJson('/api/stores');

    $response->assertStatus(200)
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.slug', 'bob-store');
});

test('user store details access validation', function () {
    $user = User::create([
        'name' => 'Charlie Access',
        'email' => 'charlie@example.com',
        'password' => Hash::make('password'),
    ]);

    $myStore = Store::create([
        'name' => 'Charlies Auto',
        'slug' => 'charlies-auto',
    ]);
    $user->stores()->attach($myStore->id, ['role' => 'owner']);

    // Create a service
    StoreService::create([
        'store_id' => $myStore->id,
        'name' => 'Test Service',
    ]);

    $otherStore = Store::create([
        'name' => 'Secret Store',
        'slug' => 'secret-store',
    ]);

    $token = $user->createToken('test-token')->plainTextToken;

    // Access to own store -> OK
    $response = $this->withHeaders([
        'Authorization' => 'Bearer '.$token,
    ])->getJson('/api/stores/'.$myStore->id);

    $response->assertStatus(200)
        ->assertJsonPath('data.name', 'Charlies Auto')
        ->assertJsonCount(1, 'data.services');

    // Access to other store -> Forbidden (403)
    $response = $this->withHeaders([
        'Authorization' => 'Bearer '.$token,
    ])->getJson('/api/stores/'.$otherStore->id);

    $response->assertStatus(403);
});

test('cached filters return marks, types and templates and handle auto cache clearing', function () {
    $user = User::create([
        'name' => 'Metadata User',
        'email' => 'meta@example.com',
        'password' => Hash::make('password'),
    ]);

    $token = $user->createToken('test-token')->plainTextToken;

    // Create marks, types, templates
    $mark = VehicleMark::create(['name' => 'Ford', 'slug' => 'ford']);
    $type = VehicleType::create(['name' => 'Truck', 'slug' => 'truck']);

    // Cache should be empty initially
    expect(Cache::has('vehicles_marks'))->toBeFalse();
    expect(Cache::has('vehicles_types'))->toBeFalse();

    // Query filters -> triggers cache fill
    $response = $this->withHeaders([
        'Authorization' => 'Bearer '.$token,
    ])->getJson('/api/filters/marks');

    $response->assertStatus(200)
        ->assertJsonPath('data.0.slug', 'ford');

    // Verify cache has entry now
    expect(Cache::has('vehicles_marks'))->toBeTrue();

    // Modify/Create a new mark -> should trigger cache clearing
    $newMark = VehicleMark::create(['name' => 'Chevrolet', 'slug' => 'chevrolet']);

    // Verify cache is cleared
    expect(Cache::has('vehicles_marks'))->toBeFalse();
});
