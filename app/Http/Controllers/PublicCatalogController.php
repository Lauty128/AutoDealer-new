<?php

namespace App\Http\Controllers;

use App\Models\Store;
use App\Models\Vehicle;
use App\Models\VehicleMark;
use App\Models\VehicleType;
use App\Models\VehicleTypeTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicCatalogController extends Controller
{
    /**
     * Display the public digital catalog of a store.
     */
    public function show(Request $request, $storeId, $vehicleId = null)
    {
        // Find store by ID or slug
        $store = Store::where('id', $storeId)->orWhere('slug', $storeId)->with('services')->firstOrFail();

        // Build vehicle query
        $query = Vehicle::with(['type', 'mark', 'details', 'images'])
            ->where('store_id', $store->id);

        // Apply filters
        if ($request->has('search') && $request->input('search') !== '') {
            $query->where('model', 'like', '%'.$request->input('search').'%');
        }

        if ($request->has('vehicle_type_id') && $request->input('vehicle_type_id') !== '') {
            $query->where('vehicle_type_id', $request->input('vehicle_type_id'));
        }

        if ($request->has('vehicle_mark_id') && $request->input('vehicle_mark_id') !== '') {
            $query->where('vehicle_mark_id', $request->input('vehicle_mark_id'));
        }

        // We show all stock, but keep the available ones at the top
        $vehicles = $query->orderByRaw("CASE WHEN status = 'available' THEN 1 WHEN status = 'reserved' THEN 2 WHEN status = 'sold' THEN 3 ELSE 4 END")
            ->orderBy('created_at', 'desc')
            ->get();

        // Get unique Marks and Types of the vehicles actually present in this store for clean filters,
        // or just load all marks and types
        $marks = VehicleMark::orderBy('name')->get();
        $types = VehicleType::orderBy('name')->get();

        // Load store-specific templates
        $storeTemplates = VehicleTypeTemplate::where('store_id', $store->id)->get();

        // Find vehicle types that do not have custom store templates
        $typesWithCustom = $storeTemplates->pluck('vehicle_type_id')->unique()->toArray();
        $systemTemplates = VehicleTypeTemplate::whereNull('store_id')
            ->whereNotIn('vehicle_type_id', $typesWithCustom)
            ->get();

        $templates = $storeTemplates->concat($systemTemplates);

        // If a specific vehicle ID is provided in the route, we render the details view
        if ($vehicleId) {
            $vehicle = Vehicle::with(['type', 'mark', 'details', 'images'])
                ->where('store_id', $store->id)
                ->findOrFail($vehicleId);

            return view('public.vehicle', [
                'store' => $store,
                'vehicle' => $vehicle,
                'templates' => $templates,
            ]);
        }

        return view('public.catalog', [
            'store' => $store,
            'vehicles' => $vehicles,
            'marks' => $marks,
            'types' => $types,
            'templates' => $templates,
        ]);
    }
}
