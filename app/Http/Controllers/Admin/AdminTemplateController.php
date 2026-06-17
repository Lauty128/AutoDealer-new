<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\VehicleType;
use App\Models\VehicleTypeTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminTemplateController extends Controller
{
    /**
     * Display templates specifically for a store.
     */
    public function storeTemplates($storeId): Response
    {
        $store = Store::findOrFail($storeId);
        $types = VehicleType::orderBy('name')->get();
        $storeTemplates = VehicleTypeTemplate::with('typeRelation')->where('store_id', $storeId)->get();
        $globalTemplates = VehicleTypeTemplate::with('typeRelation')->whereNull('store_id')->get();

        return Inertia::render('admin/stores/templates', [
            'store' => $store,
            'types' => $types,
            'storeTemplates' => $storeTemplates,
            'globalTemplates' => $globalTemplates,
            'status' => session('status'),
            'message' => session('message'),
        ]);
    }

    /**
     * Display system default templates for a specific vehicle type.
     */
    public function typeTemplates($typeId): Response
    {
        $type = VehicleType::findOrFail($typeId);
        $templates = VehicleTypeTemplate::with('typeRelation')
            ->where('vehicle_type_id', $typeId)
            ->whereNull('store_id')
            ->orderBy('label')
            ->get();

        return Inertia::render('admin/types/templates', [
            'type' => $type,
            'templates' => $templates,
            'status' => session('status'),
            'message' => session('message'),
        ]);
    }

    /**
     * Display a listing of the templates.
     */
    public function index(Request $request): Response
    {
        $query = VehicleTypeTemplate::with(['typeRelation', 'store']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('label', 'like', "%{$search}%");
        }

        if ($request->filled('vehicle_type_id')) {
            $query->where('vehicle_type_id', $request->input('vehicle_type_id'));
        }

        if ($request->filled('store_scope')) {
            $scope = $request->input('store_scope');
            if ($scope === 'global') {
                $query->whereNull('store_id');
            } elseif ($scope === 'store_specific') {
                $query->whereNotNull('store_id');
            } elseif (is_numeric($scope)) {
                $query->where('store_id', (int) $scope);
            }
        }

        $templates = $query->orderBy('label')->paginate(10)->withQueryString();
        $types = VehicleType::orderBy('name')->get();
        $stores = Store::orderBy('name')->get();

        return Inertia::render('admin/templates/index', [
            'templates' => $templates,
            'types' => $types,
            'stores' => $stores,
            'filters' => [
                'search' => $request->input('search', ''),
                'vehicle_type_id' => $request->input('vehicle_type_id', ''),
                'store_scope' => $request->input('store_scope', ''),
            ],
            'status' => session('status'),
            'message' => session('message'),
        ]);
    }

    /**
     * Store a newly created template in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'vehicle_type_id' => 'required|exists:vehicles_types,id',
            'store_id' => 'nullable|exists:stores,id',
            'label' => 'required|string|max:255',
            'type' => 'required|string|in:text,number,select,checkbox',
            'options' => 'nullable|array',
            'default_value' => 'nullable|string|max:255',
        ]);

        VehicleTypeTemplate::create([
            'vehicle_type_id' => $validated['vehicle_type_id'],
            'store_id' => $validated['store_id'] ?? null,
            'label' => $validated['label'],
            'type' => $validated['type'],
            'options' => $validated['options'] ?? null,
            'default_value' => $validated['default_value'] ?? null,
        ]);

        $redirectTypeId = $request->input('redirect_type_id');
        if ($redirectTypeId) {
            return redirect()->route('admin.types.templates', $redirectTypeId)->with([
                'status' => 'success',
                'message' => 'Plantilla de campo creada correctamente.',
            ]);
        }

        $redirectStoreId = $request->input('redirect_store_id') ?: ($validated['store_id'] ?? null);

        if ($redirectStoreId) {
            return redirect()->route('admin.stores.templates', $redirectStoreId)->with([
                'status' => 'success',
                'message' => 'Plantilla de campo creada correctamente.',
            ]);
        }

        return redirect()->route('admin.templates.index')->with([
            'status' => 'success',
            'message' => 'Plantilla de campo creada correctamente.',
        ]);
    }

    /**
     * Update the specified template in storage.
     */
    public function update(Request $request, $id)
    {
        $template = VehicleTypeTemplate::findOrFail($id);

        $validated = $request->validate([
            'vehicle_type_id' => 'required|exists:vehicles_types,id',
            'store_id' => 'nullable|exists:stores,id',
            'label' => 'required|string|max:255',
            'type' => 'required|string|in:text,number,select,checkbox',
            'options' => 'nullable|array',
            'default_value' => 'nullable|string|max:255',
        ]);

        $template->update([
            'vehicle_type_id' => $validated['vehicle_type_id'],
            'store_id' => $validated['store_id'] ?? null,
            'label' => $validated['label'],
            'type' => $validated['type'],
            'options' => $validated['options'] ?? null,
            'default_value' => $validated['default_value'] ?? null,
        ]);

        $redirectTypeId = $request->input('redirect_type_id');
        if ($redirectTypeId) {
            return redirect()->route('admin.types.templates', $redirectTypeId)->with([
                'status' => 'success',
                'message' => 'Plantilla de campo actualizada correctamente.',
            ]);
        }

        $redirectStoreId = $request->input('redirect_store_id') ?: ($template->store_id ?? $validated['store_id'] ?? null);

        if ($redirectStoreId) {
            return redirect()->route('admin.stores.templates', $redirectStoreId)->with([
                'status' => 'success',
                'message' => 'Plantilla de campo actualizada correctamente.',
            ]);
        }

        return redirect()->route('admin.templates.index')->with([
            'status' => 'success',
            'message' => 'Plantilla de campo actualizada correctamente.',
        ]);
    }

    /**
     * Remove the specified template from storage.
     */
    public function destroy(Request $request, $id)
    {
        $template = VehicleTypeTemplate::findOrFail($id);

        $redirectTypeId = $request->input('redirect_type_id');
        $redirectStoreId = $request->input('redirect_store_id') ?: $template->store_id;

        $template->delete();

        if ($redirectTypeId) {
            return redirect()->route('admin.types.templates', $redirectTypeId)->with([
                'status' => 'success',
                'message' => 'Plantilla de campo eliminada correctamente.',
            ]);
        }

        if ($redirectStoreId) {
            return redirect()->route('admin.stores.templates', $redirectStoreId)->with([
                'status' => 'success',
                'message' => 'Plantilla de campo eliminada correctamente.',
            ]);
        }

        return redirect()->route('admin.templates.index')->with([
            'status' => 'success',
            'message' => 'Plantilla de campo eliminada correctamente.',
        ]);
    }
}
