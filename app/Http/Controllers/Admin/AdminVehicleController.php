<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\Vehicle;
use App\Models\VehicleMark;
use App\Models\VehicleType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminVehicleController extends Controller
{
    /**
     * Display a listing of vehicles.
     */
    public function index(Request $request): Response
    {
        $query = Vehicle::with(['store', 'type', 'mark', 'details', 'images']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('model', 'like', "%{$search}%")
                    ->orWhere('plate', 'like', "%{$search}%");
            });
        }

        if ($request->filled('store_id')) {
            $query->where('store_id', $request->input('store_id'));
        }

        if ($request->filled('vehicle_type_id')) {
            $query->where('vehicle_type_id', $request->input('vehicle_type_id'));
        }

        if ($request->filled('vehicle_mark_id')) {
            $query->where('vehicle_mark_id', $request->input('vehicle_mark_id'));
        }

        $vehicles = $query->orderBy('created_at', 'desc')->paginate(10)->withQueryString();

        $stores = Store::orderBy('name')->get();
        $types = VehicleType::orderBy('name')->get();
        $marks = VehicleMark::orderBy('name')->get();

        return Inertia::render('admin/vehicles/index', [
            'vehicles' => $vehicles,
            'stores' => $stores,
            'types' => $types,
            'marks' => $marks,
            'filters' => [
                'search' => $request->input('search', ''),
                'store_id' => $request->input('store_id', ''),
                'vehicle_type_id' => $request->input('vehicle_type_id', ''),
                'vehicle_mark_id' => $request->input('vehicle_mark_id', ''),
            ],
            'status' => session('status'),
            'message' => session('message'),
        ]);
    }

    /**
     * Remove the specified vehicle from storage.
     */
    public function destroy($id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->delete();

        return redirect()->route('admin.vehicles.index')->with([
            'status' => 'success',
            'message' => 'Vehículo eliminado correctamente.',
        ]);
    }
}
