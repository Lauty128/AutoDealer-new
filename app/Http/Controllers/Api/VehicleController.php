<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    /**
     * Display a listing of the vehicles.
     */
    public function index(Request $request)
    {
        $request->validate([
            'store_id' => 'required|integer|exists:stores,id',
        ]);

        $storeId = $request->input('store_id');

        // Initialize query
        $query = Vehicle::with(['type', 'mark', 'details', 'images', 'store.services'])
            ->where('store_id', $storeId);

        // Optional filtering by vehicle_type_id
        if ($request->has('vehicle_type_id')) {
            $query->where('vehicle_type_id', $request->input('vehicle_type_id'));
        }

        // Optional filtering by vehicle_mark_id
        if ($request->has('vehicle_mark_id')) {
            $query->where('vehicle_mark_id', $request->input('vehicle_mark_id'));
        }

        $vehicles = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'data' => $vehicles,
        ]);
    }
}
