<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\VehicleType;
use App\Models\VehicleTypeTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TemplateController extends Controller
{
    /**
     * Show the vehicle templates edit page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $stores = $user->stores()->get();

        if ($stores->isEmpty()) {
            return Inertia::render('settings/templates', [
                'stores' => [],
                'activeStoreId' => null,
                'vehicleTypes' => [],
                'templates' => [],
                'status' => 'error',
                'message' => 'No tienes concesionarios asociados.',
            ]);
        }

        // Determine active store
        $activeStoreId = (int) $request->input('store_id', $stores->first()->id);
        $activeStore = $stores->firstWhere('id', $activeStoreId);

        if (!$activeStore) {
            $activeStore = $stores->first();
            $activeStoreId = $activeStore->id;
        }

        // Check if user is owner/manager of the active store
        $role = $activeStore->pivot->role;
        $isAuthorized = ($role === 'owner' || $role === 'manager');

        if (!$isAuthorized) {
            return Inertia::render('settings/templates', [
                'stores' => $stores->map(function ($s) {
                    return ['id' => $s->id, 'name' => $s->name];
                }),
                'activeStoreId' => $activeStoreId,
                'vehicleTypes' => [],
                'templates' => [],
                'status' => 'error',
                'message' => 'No tienes permisos para configurar las plantillas de este concesionario.',
            ]);
        }

        // Get vehicle types
        $vehicleTypes = VehicleType::orderBy('name')->get();

        // Load templates
        // 1. Get store custom templates
        $storeTemplates = VehicleTypeTemplate::where('store_id', $activeStoreId)->get();

        // 2. Get system default templates for vehicle types that do not have custom ones
        $typesWithStoreTemplates = $storeTemplates->pluck('vehicle_type_id')->unique()->toArray();
        $systemTemplates = VehicleTypeTemplate::whereNull('store_id')
            ->whereNotIn('vehicle_type_id', $typesWithStoreTemplates)
            ->get();

        // Combine them
        $templates = $storeTemplates->concat($systemTemplates);

        return Inertia::render('settings/templates', [
            'stores' => $stores->map(function ($s) {
                return [
                    'id' => $s->id,
                    'name' => $s->name,
                ];
            }),
            'activeStoreId' => $activeStoreId,
            'vehicleTypes' => $vehicleTypes,
            'templates' => $templates,
            'status' => $request->session()->get('status'),
            'message' => $request->session()->get('message'),
        ]);
    }

    /**
     * Update the templates for a vehicle type for a store.
     */
    public function update(Request $request)
    {
        $user = $request->user();
        $storeId = $request->input('store_id');
        $vehicleTypeId = $request->input('vehicle_type_id');

        // Verify that the user has access to this store and is owner/manager
        $store = $user->stores()->where('stores.id', $storeId)->firstOrFail();
        $role = $store->pivot->role;
        if ($role === 'employee' || $role === 'editor') {
            return back()->with([
                'status' => 'error',
                'message' => 'No tienes permisos para editar las plantillas de este concesionario.',
            ]);
        }

        $validated = $request->validate([
            'store_id' => 'required|exists:stores,id',
            'vehicle_type_id' => 'required|exists:vehicles_types,id',
            'templates' => 'nullable|array',
            'templates.*.label' => 'required|string|max:255',
            'templates.*.type' => 'required|string|in:text,number,select',
            'templates.*.options' => 'nullable|array',
            'templates.*.default_value' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($storeId, $vehicleTypeId, $validated) {
            // Delete existing store-specific templates for this type
            VehicleTypeTemplate::where('store_id', $storeId)
                ->where('vehicle_type_id', $vehicleTypeId)
                ->delete();

            // Insert new template fields
            $fields = $validated['templates'] ?? [];
            foreach ($fields as $field) {
                VehicleTypeTemplate::create([
                    'store_id' => $storeId,
                    'vehicle_type_id' => $vehicleTypeId,
                    'label' => $field['label'],
                    'type' => $field['type'],
                    'options' => $field['options'] ?? null,
                    'default_value' => $field['default_value'] ?? null,
                ]);
            }
        });

        return redirect()->route('templates.settings.edit', ['store_id' => $storeId])->with([
            'status' => 'success',
            'message' => 'Plantilla de especificaciones actualizada correctamente.',
        ]);
    }

    /**
     * Reset the templates for a vehicle type to system defaults.
     */
    public function reset(Request $request)
    {
        $user = $request->user();
        $storeId = $request->input('store_id');
        $vehicleTypeId = $request->input('vehicle_type_id');

        // Verify that the user has access to this store and is owner/manager
        $store = $user->stores()->where('stores.id', $storeId)->firstOrFail();
        $role = $store->pivot->role;
        if ($role === 'employee' || $role === 'editor') {
            return back()->with([
                'status' => 'error',
                'message' => 'No tienes permisos para reiniciar las plantillas de este concesionario.',
            ]);
        }

        // Delete custom templates so it falls back to system defaults
        VehicleTypeTemplate::where('store_id', $storeId)
            ->where('vehicle_type_id', $vehicleTypeId)
            ->delete();

        return redirect()->route('templates.settings.edit', ['store_id' => $storeId])->with([
            'status' => 'success',
            'message' => 'La plantilla ha sido restablecida a los valores por defecto del sistema.',
        ]);
    }
}
