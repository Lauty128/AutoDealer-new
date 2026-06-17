<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\VehicleFuel;
use App\Models\VehicleMark;
use App\Models\VehicleType;
use App\Models\VehicleTypeTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the authenticated read-only dashboard.
     */
    public function index(Request $request): Response
    {
        $data = $this->getDashboardData($request);

        return Inertia::render('dashboard', $data);
    }

    /**
     * Display the vehicle stock management console.
     */
    public function manage(Request $request): Response
    {
        $data = $this->getDashboardData($request);

        return Inertia::render('vehicles/manage', $data);
    }

    /**
     * Helper to load all necessary data for the dealership workspace.
     */
    private function getDashboardData(Request $request): array
    {
        $user = $request->user();
        $stores = $user->stores()->with('services')->get();

        if ($stores->isEmpty()) {
            return [
                'stores' => [],
                'activeStoreId' => null,
                'vehicles' => [],
                'marks' => [],
                'types' => [],
                'fuels' => [],
                'templates' => [],
                'filters' => [
                    'vehicle_type_id' => '',
                    'vehicle_mark_id' => '',
                    'search' => '',
                ],
            ];
        }

        // Determine active store
        $activeStoreId = (int) $request->input('store_id', $stores->first()->id);

        // Safety check: ensure user has access to this store
        if (! $stores->pluck('id')->contains($activeStoreId)) {
            $activeStoreId = (int) $stores->first()->id;
        }

        // Fetch filter metadata
        $marks = VehicleMark::orderBy('name')->get();
        $types = VehicleType::orderBy('name')->get();
        $fuels = VehicleFuel::orderBy('name')->get();

        // Load store-specific templates (combining store overrides and system defaults)
        $storeTemplates = VehicleTypeTemplate::where('store_id', $activeStoreId)->get();

        $typesWithStoreCustom = $storeTemplates->pluck('vehicle_type_id')->unique()->toArray();
        $systemTemplates = VehicleTypeTemplate::whereNull('store_id')
            ->whereNotIn('vehicle_type_id', $typesWithStoreCustom)
            ->get();

        $templates = $storeTemplates->concat($systemTemplates);

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

        return [
            'stores' => $stores,
            'activeStoreId' => $activeStoreId,
            'vehicles' => $vehicles,
            'marks' => $marks,
            'types' => $types,
            'fuels' => $fuels,
            'templates' => $templates,
            'filters' => [
                'vehicle_type_id' => $request->input('vehicle_type_id', ''),
                'vehicle_mark_id' => $request->input('vehicle_mark_id', ''),
                'search' => $request->input('search', ''),
            ],
        ];
    }
}
