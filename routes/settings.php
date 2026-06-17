<?php

use App\Http\Controllers\Settings\AdminSettingsController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::prefix('dashboard')->group(function () {
        Route::redirect('settings', 'dashboard/settings/profile');

        Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

        Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
        Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

        Route::get('settings/appearance', function () {
            return Inertia::render('settings/appearance');
        })->name('appearance');

        Route::get('settings/store', function () {
            return redirect()->route('store.settings.edit');
        })->name('settings.store.edit');

        // Store Templates Customization Redirects
        Route::get('settings/templates', function () {
            return redirect()->route('templates.settings.edit');
        })->name('settings.templates.edit');
    });

    // Superadmin Global Configurations Redirect
    Route::get('settings/admin', function () {
        return redirect()->route('admin.dashboard');
    })->name('settings.admin.edit');

    Route::post('settings/admin/marks', [AdminSettingsController::class, 'storeMark'])->name('settings.admin.marks.store');
    Route::put('settings/admin/marks/{id}', [AdminSettingsController::class, 'updateMark'])->name('settings.admin.marks.update');
    Route::delete('settings/admin/marks/{id}', [AdminSettingsController::class, 'destroyMark'])->name('settings.admin.marks.destroy');

    Route::post('settings/admin/types', [AdminSettingsController::class, 'storeType'])->name('settings.admin.types.store');
    Route::put('settings/admin/types/{id}', [AdminSettingsController::class, 'updateType'])->name('settings.admin.types.update');
    Route::delete('settings/admin/types/{id}', [AdminSettingsController::class, 'destroyType'])->name('settings.admin.types.destroy');

    Route::post('settings/admin/fuels', [AdminSettingsController::class, 'storeFuel'])->name('settings.admin.fuels.store');
    Route::put('settings/admin/fuels/{id}', [AdminSettingsController::class, 'updateFuel'])->name('settings.admin.fuels.update');
    Route::delete('settings/admin/fuels/{id}', [AdminSettingsController::class, 'destroyFuel'])->name('settings.admin.fuels.destroy');

    Route::post('settings/admin/templates', [AdminSettingsController::class, 'storeTemplate'])->name('settings.admin.templates.store');
    Route::put('settings/admin/templates/{id}', [AdminSettingsController::class, 'updateTemplate'])->name('settings.admin.templates.update');
    Route::delete('settings/admin/templates/{id}', [AdminSettingsController::class, 'destroyTemplate'])->name('settings.admin.templates.destroy');

    // Concesionarios (Stores) administration
    Route::post('settings/admin/stores', [AdminSettingsController::class, 'storeStore'])->name('settings.admin.stores.store');
    Route::put('settings/admin/stores/{id}', [AdminSettingsController::class, 'updateStore'])->name('settings.admin.stores.update');
    Route::delete('settings/admin/stores/{id}', [AdminSettingsController::class, 'destroyStore'])->name('settings.admin.stores.destroy');

    // Usuarios (Users) administration
    Route::post('settings/admin/users', [AdminSettingsController::class, 'storeUser'])->name('settings.admin.users.store');
    Route::put('settings/admin/users/{id}', [AdminSettingsController::class, 'updateUser'])->name('settings.admin.users.update');
    Route::delete('settings/admin/users/{id}', [AdminSettingsController::class, 'destroyUser'])->name('settings.admin.users.destroy');
});
