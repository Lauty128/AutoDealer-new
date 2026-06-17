<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\User;
use App\Models\VehicleFuel;
use App\Models\VehicleMark;
use App\Models\VehicleType;
use App\Models\VehicleTypeTemplate;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

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
                if (! $user || ! $user->is_superadmin) {
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
        $stores = Store::orderBy('name')->get();
        $users = User::with('stores')->orderBy('name')->get();

        return Inertia::render('settings/admin', [
            'marks' => $marks,
            'types' => $types,
            'fuels' => $fuels,
            'templates' => $templates,
            'stores' => $stores,
            'users' => $users,
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
            'name' => 'required|string|max:255|unique:vehicles_marks,name,'.$id,
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
            'name' => 'required|string|max:255|unique:vehicles_types,name,'.$id,
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
            'name' => 'required|string|max:255|unique:vehicle_fuels,name,'.$id,
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

    // --- Stores CRUD ---
    public function storeStore(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:stores,slug',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:255',
        ]);

        Store::create($validated);

        return back()->with([
            'status' => 'success',
            'message' => 'Concesionario creado correctamente.',
        ]);
    }

    public function updateStore(Request $request, $id)
    {
        $store = Store::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:stores,slug,'.$id,
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:255',
        ]);

        $store->update($validated);

        return back()->with([
            'status' => 'success',
            'message' => 'Concesionario actualizado correctamente.',
        ]);
    }

    public function destroyStore($id)
    {
        $store = Store::findOrFail($id);
        $store->delete();

        return back()->with([
            'status' => 'success',
            'message' => 'Concesionario eliminado correctamente.',
        ]);
    }

    // --- Users CRUD ---
    public function storeUser(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'is_superadmin' => $request->boolean('is_superadmin'),
        ]);

        if ($request->has('stores')) {
            $storesData = [];
            foreach ($request->input('stores') as $s) {
                if (! empty($s['store_id'])) {
                    $storesData[$s['store_id']] = ['role' => $s['role'] ?? 'editor'];
                }
            }
            $user->stores()->sync($storesData);
        }

        return back()->with([
            'status' => 'success',
            'message' => 'Usuario creado correctamente.',
        ]);
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$id,
            'password' => 'nullable|string|min:8',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'is_superadmin' => $request->boolean('is_superadmin'),
        ];

        if ($request->filled('password')) {
            $updateData['password'] = bcrypt($request->input('password'));
        }

        $user->update($updateData);

        if ($request->has('stores')) {
            $storesData = [];
            foreach ($request->input('stores') as $s) {
                if (! empty($s['store_id'])) {
                    $storesData[$s['store_id']] = ['role' => $s['role'] ?? 'editor'];
                }
            }
            $user->stores()->sync($storesData);
        } else {
            $user->stores()->detach();
        }

        return back()->with([
            'status' => 'success',
            'message' => 'Usuario actualizado correctamente.',
        ]);
    }

    public function destroyUser($id)
    {
        $user = User::findOrFail($id);

        // Prevent superadmin from deleting themselves
        if ($user->id === auth()->id()) {
            return back()->with([
                'status' => 'error',
                'message' => 'No puedes eliminar tu propio usuario de administrador.',
            ]);
        }

        $user->delete();

        return back()->with([
            'status' => 'success',
            'message' => 'Usuario eliminado correctamente.',
        ]);
    }
}
