<?php

use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminFuelController;
use App\Http\Controllers\Admin\AdminMarkController;
use App\Http\Controllers\Admin\AdminStoreController;
use App\Http\Controllers\Admin\AdminTemplateController;
use App\Http\Controllers\Admin\AdminTypeController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminVehicleController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PublicCatalogController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\StoreController;
use App\Http\Controllers\Settings\TemplateController;
use App\Http\Controllers\VehicleController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Public Digital Catalog Showroom
Route::get('concesionario/{store}/{vehicle?}', [PublicCatalogController::class, 'show'])->name('public.catalog');

// Authenticated routes
Route::middleware(['auth', 'impersonate_superadmin'])->prefix('dashboard')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Vehicles Manage Page (interactive CRUD table/list)
    Route::get('vehicles/manage', [DashboardController::class, 'manage'])->name('vehicles.manage');

    // Standalone vehicle form screens & print
    Route::get('vehicles/create', [VehicleController::class, 'create'])->name('vehicles.create');
    Route::get('vehicles/{vehicle}/edit', [VehicleController::class, 'edit'])->name('vehicles.edit');
    Route::get('vehicles/{vehicle}/print', [VehicleController::class, 'print'])->name('vehicles.print');

    // Vehicles CRUD Actions
    Route::post('vehicles', [VehicleController::class, 'store'])->name('vehicles.store');
    Route::post('vehicles/{vehicle}', [VehicleController::class, 'update'])->name('vehicles.update');
    Route::delete('vehicles/{vehicle}', [VehicleController::class, 'destroy'])->name('vehicles.destroy');
    Route::post('vehicles/{vehicle}/status', [VehicleController::class, 'updateStatus'])->name('vehicles.updateStatus');

    // Direct Store Settings Page
    Route::get('store/settings', [StoreController::class, 'edit'])->name('store.settings.edit');
    Route::post('store/settings', [StoreController::class, 'update'])->name('store.settings.update');

    // Direct Templates Settings Page
    Route::get('templates/settings', [TemplateController::class, 'edit'])->name('templates.settings.edit');
    Route::post('templates/settings', [TemplateController::class, 'update'])->name('templates.settings.update');
    Route::post('templates/settings/reset', [TemplateController::class, 'reset'])->name('templates.settings.reset');
});

// Administrative standalone panel routes
Route::prefix('admin')->name('admin.')->group(function () {
    Route::redirect('/', 'admin/dashboard');

    // Guest Admin routes
    Route::middleware(['guest'])->group(function () {
        Route::get('login', [AdminAuthController::class, 'showLogin'])->name('login');
        Route::post('login', [AdminAuthController::class, 'login']);
    });

    // Authenticated Admin routes
    Route::middleware(['auth', 'superadmin'])->group(function () {
        Route::post('logout', [AdminAuthController::class, 'logout'])->name('logout');

        Route::get('dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

        // Users CRUD
        Route::get('users', [AdminUserController::class, 'index'])->name('users.index');
        Route::post('users', [AdminUserController::class, 'store'])->name('users.store');
        Route::post('users/{id}', [AdminUserController::class, 'update'])->name('users.update');
        Route::delete('users/{id}', [AdminUserController::class, 'destroy'])->name('users.destroy');

        // Stores CRUD
        Route::get('stores', [AdminStoreController::class, 'index'])->name('stores.index');
        Route::post('stores', [AdminStoreController::class, 'store'])->name('stores.store');
        Route::post('stores/{id}/impersonate', [AdminStoreController::class, 'impersonate'])->name('stores.impersonate');
        Route::post('stores/{id}', [AdminStoreController::class, 'update'])->name('stores.update');
        Route::delete('stores/{id}', [AdminStoreController::class, 'destroy'])->name('stores.destroy');

        // Templates CRUD
        Route::get('stores/{storeId}/templates', [AdminTemplateController::class, 'storeTemplates'])->name('stores.templates');
        Route::get('types/{typeId}/templates', [AdminTemplateController::class, 'typeTemplates'])->name('types.templates');
        Route::get('templates', [AdminTemplateController::class, 'index'])->name('templates.index');
        Route::post('templates', [AdminTemplateController::class, 'store'])->name('templates.store');
        Route::post('templates/{id}', [AdminTemplateController::class, 'update'])->name('templates.update');
        Route::delete('templates/{id}', [AdminTemplateController::class, 'destroy'])->name('templates.destroy');

        // Vehicles List/Delete
        Route::get('vehicles', [AdminVehicleController::class, 'index'])->name('vehicles.index');
        Route::delete('vehicles/{id}', [AdminVehicleController::class, 'destroy'])->name('vehicles.destroy');

        // Marks CRUD
        Route::get('marks', [AdminMarkController::class, 'index'])->name('marks.index');
        Route::post('marks', [AdminMarkController::class, 'store'])->name('marks.store');
        Route::post('marks/{id}', [AdminMarkController::class, 'update'])->name('marks.update');
        Route::delete('marks/{id}', [AdminMarkController::class, 'destroy'])->name('marks.destroy');

        // Types CRUD
        Route::get('types', [AdminTypeController::class, 'index'])->name('types.index');
        Route::post('types', [AdminTypeController::class, 'store'])->name('types.store');
        Route::post('types/{id}', [AdminTypeController::class, 'update'])->name('types.update');
        Route::delete('types/{id}', [AdminTypeController::class, 'destroy'])->name('types.destroy');

        // Fuels CRUD
        Route::get('fuels', [AdminFuelController::class, 'index'])->name('fuels.index');
        Route::post('fuels', [AdminFuelController::class, 'store'])->name('fuels.store');
        Route::post('fuels/{id}', [AdminFuelController::class, 'update'])->name('fuels.update');
        Route::delete('fuels/{id}', [AdminFuelController::class, 'destroy'])->name('fuels.destroy');

        // Standalone Settings routes for Admin
        Route::prefix('settings')->name('settings.')->group(function () {
            Route::redirect('/', '/admin/settings/profile');
            Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
            Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
            Route::delete('profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

            Route::get('password', [PasswordController::class, 'edit'])->name('password.edit');
            Route::put('password', [PasswordController::class, 'update'])->name('password.update');

            Route::get('appearance', function () {
                return Inertia::render('settings/appearance');
            })->name('appearance');
        });
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
