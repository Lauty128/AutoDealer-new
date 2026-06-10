<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\StoreController;
use App\Http\Controllers\Api\VehicleController;
use App\Http\Controllers\Api\MetadataController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (require Bearer Token)
Route::middleware('auth:sanctum')->group(function () {
    
    // Session Verification & User Profile with Authorized Stores
    Route::get('/user', function (Request $request) {
        $user = $request->user();
        $user->load(['stores.services']);
        return response()->json([
            'user' => $user
        ]);
    });

    // Stores (Concesionarios)
    Route::get('/stores', [StoreController::class, 'index']);
    Route::get('/stores/{store}', [StoreController::class, 'show']);

    // Vehicles (Vehículos)
    Route::get('/vehicles', [VehicleController::class, 'index']);

    // Cached Metadata (Filtros de consulta frecuente)
    Route::get('/filters/marks', [MetadataController::class, 'marks']);
    Route::get('/filters/types', [MetadataController::class, 'types']);
    Route::get('/filters/templates', [MetadataController::class, 'templates']);
});
