<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\VehicleImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class VehicleController extends Controller
{
    /**
     * Store a newly created vehicle in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $storeId = $request->input('store_id');

        // Check if user has access to the store
        $store = $user->stores()->where('stores.id', $storeId)->firstOrFail();
        $role = $store->pivot->role;
        $isEmployee = ($role === 'employee' || $role === 'editor');

        $rules = [
            'store_id' => 'required|exists:stores,id',
            'vehicle_type_id' => 'required|exists:vehicles_types,id',
            'vehicle_mark_id' => 'required|exists:vehicles_marks,id',
            'model' => 'required|string|max:255',
            'year' => 'required|integer|min:1900|max:'.(date('Y') + 2),
            'price' => 'required|numeric|min:0',
            'currency' => 'required|string|max:3',
            'plate' => 'nullable|string|max:20',
            'engine' => 'nullable|string|max:255',
            'suspension' => 'nullable|string|max:255',
            'fuel_type' => 'nullable|string|max:255',
            'mileage' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
            'status' => 'required|string|in:available,reserved,sold',
            'cover_image_file' => 'nullable|image|max:2048', // 2MB max
            'images_files.*' => 'nullable|image|max:2048', // 2MB max
            'details' => 'nullable|array',
        ];

        // Only owner/manager can set cost_price
        if (! $isEmployee) {
            $rules['cost_price'] = 'nullable|numeric|min:0';
        }

        $validated = $request->validate($rules);

        return DB::transaction(function () use ($request, $validated, $store, $isEmployee) {
            $vehicleData = collect($validated)->except(['cover_image_file', 'images_files', 'details'])->toArray();

            // Ignore cost_price for employees even if they somehow send it
            if ($isEmployee) {
                unset($vehicleData['cost_price']);
            }

            // Handle cover image upload
            if ($request->hasFile('cover_image_file')) {
                $path = $request->file('cover_image_file')->store('vehicles/covers', 'public');
                $vehicleData['cover_image'] = Storage::url($path);
            }

            $vehicle = Vehicle::create($vehicleData);

            // Handle gallery images upload
            if ($request->hasFile('images_files')) {
                $sortOrder = 1;
                foreach ($request->file('images_files') as $file) {
                    $path = $file->store('vehicles/galleries', 'public');
                    $vehicle->images()->create([
                        'path' => Storage::url($path),
                        'sort_order' => $sortOrder++,
                    ]);
                }
            }

            // Handle dynamic details based on templates
            $details = $request->input('details', []);
            foreach ($details as $label => $value) {
                if ($value !== null && $value !== '') {
                    $vehicle->details()->create([
                        'label' => $label,
                        'value' => $value,
                    ]);
                }
            }

            return redirect()->route('dashboard', ['store_id' => $store->id])->with([
                'status' => 'success',
                'message' => 'El vehículo ha sido agregado con éxito.',
            ]);
        });
    }

    /**
     * Update the specified vehicle in storage.
     * Note: We use POST for updates to support file uploads.
     */
    public function update(Request $request, Vehicle $vehicle)
    {
        $user = $request->user();
        $store = $user->stores()->where('stores.id', $vehicle->store_id)->firstOrFail();
        $role = $store->pivot->role;
        $isEmployee = ($role === 'employee' || $role === 'editor');

        $rules = [
            'vehicle_type_id' => 'required|exists:vehicles_types,id',
            'vehicle_mark_id' => 'required|exists:vehicles_marks,id',
            'model' => 'required|string|max:255',
            'year' => 'required|integer|min:1900|max:'.(date('Y') + 2),
            'price' => 'required|numeric|min:0',
            'currency' => 'required|string|max:3',
            'plate' => 'nullable|string|max:20',
            'engine' => 'nullable|string|max:255',
            'suspension' => 'nullable|string|max:255',
            'fuel_type' => 'nullable|string|max:255',
            'mileage' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
            'status' => 'required|string|in:available,reserved,sold',
            'cover_image_file' => 'nullable|image|max:2048', // 2MB max
            'images_files.*' => 'nullable|image|max:2048', // 2MB max
            'delete_images' => 'nullable|array',
            'delete_images.*' => 'integer|exists:vehicles_images,id',
            'details' => 'nullable|array',
        ];

        // Only owner/manager can update cost_price
        if (! $isEmployee) {
            $rules['cost_price'] = 'nullable|numeric|min:0';
        }

        $validated = $request->validate($rules);

        return DB::transaction(function () use ($request, $validated, $vehicle, $store, $isEmployee) {
            $vehicleData = collect($validated)->except(['cover_image_file', 'images_files', 'delete_images', 'details'])->toArray();

            if ($isEmployee) {
                unset($vehicleData['cost_price']);
            }

            // Handle cover image update
            if ($request->hasFile('cover_image_file')) {
                // Delete old cover image if it exists in local storage
                if ($vehicle->cover_image && str_starts_with($vehicle->cover_image, '/storage/')) {
                    $oldPath = str_replace('/storage/', '', $vehicle->cover_image);
                    Storage::disk('public')->delete($oldPath);
                }
                $path = $request->file('cover_image_file')->store('vehicles/covers', 'public');
                $vehicleData['cover_image'] = Storage::url($path);
            }

            $vehicle->update($vehicleData);

            // Handle deleting gallery images
            $deleteImages = $request->input('delete_images', []);
            if (! empty($deleteImages)) {
                $imagesToDel = VehicleImage::whereIn('id', $deleteImages)->get();
                foreach ($imagesToDel as $img) {
                    if (str_starts_with($img->path, '/storage/')) {
                        $oldPath = str_replace('/storage/', '', $img->path);
                        Storage::disk('public')->delete($oldPath);
                    }
                    $img->delete();
                }
            }

            // Handle uploading new gallery images
            if ($request->hasFile('images_files')) {
                // Find current max sort order
                $maxSort = $vehicle->images()->max('sort_order') ?? 0;
                foreach ($request->file('images_files') as $file) {
                    $path = $file->store('vehicles/galleries', 'public');
                    $vehicle->images()->create([
                        'path' => Storage::url($path),
                        'sort_order' => ++$maxSort,
                    ]);
                }
            }

            // Handle dynamic details: delete old and recreate
            $vehicle->details()->delete();
            $details = $request->input('details', []);
            foreach ($details as $label => $value) {
                if ($value !== null && $value !== '') {
                    $vehicle->details()->create([
                        'label' => $label,
                        'value' => $value,
                    ]);
                }
            }

            return redirect()->route('dashboard', ['store_id' => $store->id])->with([
                'status' => 'success',
                'message' => 'El vehículo ha sido actualizado con éxito.',
            ]);
        });
    }

    /**
     * Remove the specified vehicle from storage.
     */
    public function destroy(Request $request, Vehicle $vehicle)
    {
        $user = $request->user();
        $store = $user->stores()->where('stores.id', $vehicle->store_id)->firstOrFail();

        return DB::transaction(function () use ($vehicle, $store) {
            // Delete cover image from local storage
            if ($vehicle->cover_image && str_starts_with($vehicle->cover_image, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $vehicle->cover_image);
                Storage::disk('public')->delete($oldPath);
            }

            // Delete gallery images from local storage
            foreach ($vehicle->images as $img) {
                if (str_starts_with($img->path, '/storage/')) {
                    $oldPath = str_replace('/storage/', '', $img->path);
                    Storage::disk('public')->delete($oldPath);
                }
            }

            // Delete vehicle (cascading deletes table records)
            $vehicle->delete();

            return redirect()->route('dashboard', ['store_id' => $store->id])->with([
                'status' => 'success',
                'message' => 'El vehículo ha sido eliminado con éxito.',
            ]);
        });
    }

    /**
     * Quick update status.
     */
    public function updateStatus(Request $request, Vehicle $vehicle)
    {
        $user = $request->user();
        $store = $user->stores()->where('stores.id', $vehicle->store_id)->firstOrFail();

        $validated = $request->validate([
            'status' => 'required|string|in:available,reserved,sold',
        ]);

        $vehicle->update([
            'status' => $validated['status'],
        ]);

        return redirect()->route('dashboard', ['store_id' => $store->id])->with([
            'status' => 'success',
            'message' => 'El estado del vehículo ha sido modificado con éxito.',
        ]);
    }
}
