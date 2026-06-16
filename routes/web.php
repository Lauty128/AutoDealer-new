<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\PublicCatalogController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Public Digital Catalog Showroom
Route::get('catalogo/{slug}', [PublicCatalogController::class, 'show'])->name('public.catalog');

// Authenticated routes
Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Vehicles Manage Page (interactive CRUD table/list)
    Route::get('vehicles/manage', [DashboardController::class, 'manage'])->name('vehicles.manage');
    
    // Vehicles CRUD Actions
    Route::post('vehicles', [VehicleController::class, 'store'])->name('vehicles.store');
    Route::post('vehicles/{vehicle}', [VehicleController::class, 'update'])->name('vehicles.update');
    Route::delete('vehicles/{vehicle}', [VehicleController::class, 'destroy'])->name('vehicles.destroy');
    Route::post('vehicles/{vehicle}/status', [VehicleController::class, 'updateStatus'])->name('vehicles.updateStatus');

    // Direct Store Settings Page
    Route::get('store/settings', [\App\Http\Controllers\Settings\StoreController::class, 'edit'])->name('store.settings.edit');
    Route::post('store/settings', [\App\Http\Controllers\Settings\StoreController::class, 'update'])->name('store.settings.update');

    // Direct Templates Settings Page
    Route::get('templates/settings', [\App\Http\Controllers\Settings\TemplateController::class, 'edit'])->name('templates.settings.edit');
    Route::post('templates/settings', [\App\Http\Controllers\Settings\TemplateController::class, 'update'])->name('templates.settings.update');
    Route::post('templates/settings/reset', [\App\Http\Controllers\Settings\TemplateController::class, 'reset'])->name('templates.settings.reset');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
