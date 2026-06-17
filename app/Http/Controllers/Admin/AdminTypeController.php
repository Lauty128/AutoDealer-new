<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VehicleType;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminTypeController extends Controller
{
    /**
     * Display a listing of the vehicle types.
     */
    public function index(Request $request): Response
    {
        $query = VehicleType::withCount('vehicles');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('slug', 'like', "%{$search}%");
        }

        $types = $query->orderBy('name')->paginate(10)->withQueryString();

        return Inertia::render('admin/types/index', [
            'types' => $types,
            'filters' => [
                'search' => $request->input('search', ''),
            ],
            'status' => session('status'),
            'message' => session('message'),
        ]);
    }

    /**
     * Store a newly created vehicle type.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:vehicles_types,name',
        ]);

        VehicleType::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);

        return redirect()->route('admin.types.index')->with([
            'status' => 'success',
            'message' => 'Tipo de vehículo creado correctamente.',
        ]);
    }

    /**
     * Update the specified vehicle type.
     */
    public function update(Request $request, $id)
    {
        $type = VehicleType::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:vehicles_types,name,'.$id,
        ]);

        $type->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);

        return redirect()->route('admin.types.index')->with([
            'status' => 'success',
            'message' => 'Tipo de vehículo actualizado correctamente.',
        ]);
    }

    /**
     * Remove the specified vehicle type.
     */
    public function destroy($id)
    {
        $type = VehicleType::findOrFail($id);

        try {
            $type->delete();

            return redirect()->route('admin.types.index')->with([
                'status' => 'success',
                'message' => 'Tipo de vehículo eliminado correctamente.',
            ]);
        } catch (QueryException $e) {
            return redirect()->route('admin.types.index')->with([
                'status' => 'error',
                'message' => 'No se puede eliminar el tipo de vehículo porque está asignado a uno o más vehículos en el inventario.',
            ]);
        }
    }
}
