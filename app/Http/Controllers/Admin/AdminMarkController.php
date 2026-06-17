<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VehicleMark;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminMarkController extends Controller
{
    /**
     * Display a listing of the vehicle marks.
     */
    public function index(Request $request): Response
    {
        $query = VehicleMark::withCount('vehicles');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('slug', 'like', "%{$search}%");
        }

        $marks = $query->orderBy('name')->paginate(10)->withQueryString();

        return Inertia::render('admin/marks/index', [
            'marks' => $marks,
            'filters' => [
                'search' => $request->input('search', ''),
            ],
            'status' => session('status'),
            'message' => session('message'),
        ]);
    }

    /**
     * Store a newly created vehicle mark.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:vehicles_marks,name',
        ]);

        VehicleMark::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);

        return redirect()->route('admin.marks.index')->with([
            'status' => 'success',
            'message' => 'Marca creada correctamente.',
        ]);
    }

    /**
     * Update the specified vehicle mark.
     */
    public function update(Request $request, $id)
    {
        $mark = VehicleMark::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:vehicles_marks,name,'.$id,
        ]);

        $mark->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);

        return redirect()->route('admin.marks.index')->with([
            'status' => 'success',
            'message' => 'Marca actualizada correctamente.',
        ]);
    }

    /**
     * Remove the specified vehicle mark.
     */
    public function destroy($id)
    {
        $mark = VehicleMark::findOrFail($id);

        try {
            $mark->delete();

            return redirect()->route('admin.marks.index')->with([
                'status' => 'success',
                'message' => 'Marca eliminada correctamente.',
            ]);
        } catch (QueryException $e) {
            return redirect()->route('admin.marks.index')->with([
                'status' => 'error',
                'message' => 'No se puede eliminar la marca porque está asignada a uno o más vehículos en el inventario.',
            ]);
        }
    }
}
