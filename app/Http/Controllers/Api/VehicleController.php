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
        $user = $request->user();
        
        // Get the IDs of the stores this user has access to
        $allowedStoreIds = $user->stores->pluck('id')->toArray();

        if (empty($allowedStoreIds)) {
            return response()->json([
                'data' => []
            ]);
        }

        // Initialize query
        $query = Vehicle::with(['type', 'mark', 'details', 'images', 'store.services'])
            ->whereIn('store_id', $allowedStoreIds);

        // Optional filtering by store_id
        if ($request->has('store_id')) {
            $storeId = $request->input('store_id');
            // Ensure the user actually has access to the requested store
            if (!in_array($storeId, $allowedStoreIds)) {
                return response()->json([
                    'message' => 'No tienes acceso al concesionario solicitado.'
                ], 403);
            }
            $query->where('store_id', $storeId);
        }

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
            'data' => $vehicles
        ]);
    }
}
