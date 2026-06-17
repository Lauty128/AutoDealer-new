<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VehicleFuel;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminFuelController extends Controller
{
    /**
     * Display a listing of the vehicle fuels.
     */
    public function index(Request $request): Response
    {
        $query = VehicleFuel::query();

        // Since fuel_type is stored as a string in vehicles, we subquery the count.
        $query->select('vehicle_fuels.*')
            ->selectSub(function ($q) {
                $q->selectRaw('count(*)')
                    ->from('vehicles')
                    ->whereColumn('vehicles.fuel_type', 'vehicle_fuels.name');
            }, 'vehicles_count');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }

        $fuels = $query->orderBy('name')->paginate(10)->withQueryString();

        return Inertia::render('admin/fuels/index', [
            'fuels' => $fuels,
            'filters' => [
                'search' => $request->input('search', ''),
            ],
            'status' => session('status'),
            'message' => session('message'),
        ]);
    }

    /**
     * Store a newly created vehicle fuel.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:vehicle_fuels,name',
        ]);

        VehicleFuel::create([
            'name' => $validated['name'],
        ]);

        return redirect()->route('admin.fuels.index')->with([
            'status' => 'success',
            'message' => 'Tipo de combustible creado correctamente.',
        ]);
    }

    /**
     * Update the specified vehicle fuel.
     */
    public function update(Request $request, $id)
    {
        $fuel = VehicleFuel::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:vehicle_fuels,name,'.$id,
        ]);

        $fuel->update([
            'name' => $validated['name'],
        ]);

        return redirect()->route('admin.fuels.index')->with([
            'status' => 'success',
            'message' => 'Tipo de combustible actualizado correctamente.',
        ]);
    }

    /**
     * Remove the specified vehicle fuel.
     */
    public function destroy($id)
    {
        $fuel = VehicleFuel::findOrFail($id);

        try {
            $fuel->delete();

            return redirect()->route('admin.fuels.index')->with([
                'status' => 'success',
                'message' => 'Tipo de combustible eliminado correctamente.',
            ]);
        } catch (QueryException $e) {
            return redirect()->route('admin.fuels.index')->with([
                'status' => 'error',
                'message' => 'No se puede eliminar el tipo de combustible.',
            ]);
        }
    }
}
