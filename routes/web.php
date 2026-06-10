<?php

use App\Models\Vehicle;
use App\Models\VehicleMark;
use App\Models\VehicleType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function (Request $request) {
        $user = $request->user();
        $stores = $user->stores()->with('services')->get();

        if ($stores->isEmpty()) {
            return Inertia::render('dashboard', [
                'stores' => [],
                'activeStoreId' => null,
                'vehicles' => [],
                'marks' => [],
                'types' => [],
                'filters' => [
                    'vehicle_type_id' => '',
                    'vehicle_mark_id' => '',
                    'search' => '',
                ],
            ]);
        }

        // Determine active store
        $activeStoreId = $request->input('store_id', $stores->first()->id);

        // Safety check: ensure user has access to this store
        if (! $stores->pluck('id')->contains($activeStoreId)) {
            $activeStoreId = $stores->first()->id;
        }

        // Fetch filter metadata
        $marks = VehicleMark::orderBy('name')->get();
        $types = VehicleType::orderBy('name')->get();

        // Query vehicles
        $query = Vehicle::with(['type', 'mark', 'details', 'images'])
            ->where('store_id', $activeStoreId);

        // Apply query filters
        if ($request->has('vehicle_type_id') && $request->input('vehicle_type_id') !== '') {
            $query->where('vehicle_type_id', $request->input('vehicle_type_id'));
        }

        if ($request->has('vehicle_mark_id') && $request->input('vehicle_mark_id') !== '') {
            $query->where('vehicle_mark_id', $request->input('vehicle_mark_id'));
        }

        if ($request->has('search') && $request->input('search') !== '') {
            $query->where('model', 'like', '%'.$request->input('search').'%');
        }

        $vehicles = $query->orderBy('created_at', 'desc')->get();

        return Inertia::render('dashboard', [
            'stores' => $stores,
            'activeStoreId' => (int) $activeStoreId,
            'vehicles' => $vehicles,
            'marks' => $marks,
            'types' => $types,
            'filters' => [
                'vehicle_type_id' => $request->input('vehicle_type_id', ''),
                'vehicle_mark_id' => $request->input('vehicle_mark_id', ''),
                'search' => $request->input('search', ''),
            ],
        ]);
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
