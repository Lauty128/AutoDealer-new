<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\VehicleMark;
use App\Models\VehicleType;
use App\Models\VehicleFuel;
use App\Models\VehicleTypeTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class AdminSettingsController extends Controller implements HasMiddleware
{
    /**
     * Get the middleware that should be assigned to the controller.
     */
    public static function middleware(): array
    {
        return [
            new Middleware(function ($request, $next) {
                $user = $request->user();
                if (!$user || !$user->is_superadmin) {
                    abort(403, 'No estás autorizado para acceder a esta sección.');
                }
                return $next($request);
            }),
        ];
    }

    /**
     * Show the admin settings dashboard.
     */
    public function edit(Request $request): Response
    {
        $marks = VehicleMark::orderBy('name')->get();
        $types = VehicleType::orderBy('name')->get();
        $fuels = VehicleFuel::orderBy('name')->get();
        $templates = VehicleTypeTemplate::whereNull('store_id')->get();

        return Inertia::render('settings/admin', [
            'marks' => $marks,
            'types' => $types,
            'fuels' => $fuels,
            'templates' => $templates,
            'status' => $request->session()->get('status'),
            'message' => $request->session()->get('message'),
        ]);
    }

    // --- Vehicle Marks (Brands) CRUD ---
    public function storeMark(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:vehicles_marks,name',
        ]);

        VehicleMark::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);

        return back()->with([
            'status' => 'success',
            'message' => 'Marca de vehículo creada correctamente.',
        ]);
    }

    public function updateMark(Request $request, $id)
    {
        $mark = VehicleMark::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:vehicles_marks,name,' . $id,
        ]);

        $mark->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);

        return back()->with([
            'status' => 'success',
            'message' => 'Marca de vehículo actualizada correctamente.',
        ]);
    }

    public function destroyMark($id)
    {
        $mark = VehicleMark::findOrFail($id);
        $mark->delete();

        return back()->with([
            'status' => 'success',
            'message' => 'Marca de vehículo eliminada correctamente.',
        ]);
    }

    // --- Vehicle Types CRUD ---
    public function storeType(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:vehicles_types,name',
        ]);

        VehicleType::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);

        return back()->with([
            'status' => 'success',
            'message' => 'Tipo de vehículo creado correctamente.',
        ]);
    }

    public function updateType(Request $request, $id)
    {
        $type = VehicleType::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:vehicles_types,name,' . $id,
        ]);

        $type->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);

        return back()->with([
            'status' => 'success',
            'message' => 'Tipo de vehículo actualizado correctamente.',
        ]);
    }

    public function destroyType($id)
    {
        $type = VehicleType::findOrFail($id);
        $type->delete();

        return back()->with([
            'status' => 'success',
            'message' => 'Tipo de vehículo eliminado correctamente.',
        ]);
    }

    // --- Vehicle Fuels CRUD ---
    public function storeFuel(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:vehicle_fuels,name',
        ]);

        VehicleFuel::create([
            'name' => $validated['name'],
        ]);

        return back()->with([
            'status' => 'success',
            'message' => 'Tipo de combustible creado correctamente.',
        ]);
    }

    public function updateFuel(Request $request, $id)
    {
        $fuel = VehicleFuel::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:vehicle_fuels,name,' . $id,
        ]);

        $fuel->update([
            'name' => $validated['name'],
        ]);

        return back()->with([
            'status' => 'success',
            'message' => 'Tipo de combustible actualizado correctamente.',
        ]);
    }

    public function destroyFuel($id)
    {
        $fuel = VehicleFuel::findOrFail($id);
        $fuel->delete();

        return back()->with([
            'status' => 'success',
            'message' => 'Tipo de combustible eliminado correctamente.',
        ]);
    }

    // --- Global Templates CRUD ---
    public function storeTemplate(Request $request)
    {
        $validated = $request->validate([
            'vehicle_type_id' => 'required|exists:vehicles_types,id',
            'label' => 'required|string|max:255',
            'type' => 'required|string|in:text,number,select',
            'options' => 'nullable|array',
            'default_value' => 'nullable|string|max:255',
        ]);

        VehicleTypeTemplate::create([
            'vehicle_type_id' => $validated['vehicle_type_id'],
            'store_id' => null, // Global default template
            'label' => $validated['label'],
            'type' => $validated['type'],
            'options' => $validated['options'] ?? null,
            'default_value' => $validated['default_value'] ?? null,
        ]);

        return back()->with([
            'status' => 'success',
            'message' => 'Campo de plantilla global creado correctamente.',
        ]);
    }

    public function updateTemplate(Request $request, $id)
    {
        $template = VehicleTypeTemplate::findOrFail($id);
        
        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'type' => 'required|string|in:text,number,select',
            'options' => 'nullable|array',
            'default_value' => 'nullable|string|max:255',
        ]);

        $template->update([
            'label' => $validated['label'],
            'type' => $validated['type'],
            'options' => $validated['options'] ?? null,
            'default_value' => $validated['default_value'] ?? null,
        ]);

        return back()->with([
            'status' => 'success',
            'message' => 'Campo de plantilla global actualizado correctamente.',
        ]);
    }

    public function destroyTemplate($id)
    {
        $template = VehicleTypeTemplate::findOrFail($id);
        $template->delete();

        return back()->with([
            'status' => 'success',
            'message' => 'Campo de plantilla global eliminado correctamente.',
        ]);
    }
}
