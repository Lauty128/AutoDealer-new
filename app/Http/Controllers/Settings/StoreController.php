<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class StoreController extends Controller
{
    /**
     * Show the store settings edit page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $stores = $user->stores()->with('services')->get();

        if ($stores->isEmpty()) {
            return Inertia::render('settings/store', [
                'stores' => [],
                'activeStore' => null,
                'status' => 'error',
                'message' => 'No tienes concesionarios asociados.',
            ]);
        }

        // Determine active store
        $activeStoreId = $request->input('store_id', $stores->first()->id);

        // Safety check: ensure user has access to this store
        $activeStore = $stores->firstWhere('id', $activeStoreId);
        if (! $activeStore) {
            $activeStore = $stores->first();
        }

        // Role check: only owner or manager can access settings
        if ($activeStore->pivot->role !== 'owner' && $activeStore->pivot->role !== 'manager') {
            abort(403, 'No tienes permisos para configurar este concesionario.');
        }

        // Build WhatsApp support URL
        $supportPhone = config('services.whatsapp.support_phone', '');
        $activationTemplate = config('services.whatsapp.activation_message', 'Hola! Deseo habilitar el catálogo de WhatsApp para el concesionario: {store_name} (ID: {store_id}).');

        $activationMessage = str_replace(
            ['{store_name}', '{store_id}'],
            [$activeStore->name, $activeStore->id],
            $activationTemplate
        );

        $whatsappSupportUrl = 'https://wa.me/'.preg_replace('/\D/', '', $supportPhone).'?text='.urlencode($activationMessage);

        return Inertia::render('settings/store', [
            'stores' => $stores->filter(function ($store) {
                return $store->pivot->role === 'owner' || $store->pivot->role === 'manager';
            })->map(function ($store) {
                return [
                    'id' => $store->id,
                    'name' => $store->name,
                ];
            })->values(),
            'activeStore' => $activeStore,
            'whatsappSupportUrl' => $whatsappSupportUrl,
            'status' => $request->session()->get('status'),
            'message' => $request->session()->get('message'),
        ]);
    }

    /**
     * Update the store settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();
        $storeId = $request->input('id');

        // Verify that the user has access to this store
        $store = $user->stores()->with('services')->where('stores.id', $storeId)->first();

        if (! $store) {
            return back()->with([
                'status' => 'error',
                'message' => 'No estás autorizado para editar este concesionario.',
            ]);
        }

        // Role check: only owner or manager can update settings
        if ($store->pivot->role !== 'owner' && $store->pivot->role !== 'manager') {
            return back()->with([
                'status' => 'error',
                'message' => 'No tienes permisos suficientes para configurar este concesionario.',
            ]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:stores,slug,'.$store->id,
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'whatsapp' => 'nullable|string|max:255',
            'instagram' => 'nullable|string|max:255',
            'facebook' => 'nullable|string|max:255',
            'tiktok' => 'nullable|string|max:255',
            'website' => 'nullable|string|max:255',
            'logo_file' => 'nullable|image|max:2048', // 2MB max
            'banner_file' => 'nullable|image|max:4096', // 4MB max
            'primary_color' => 'nullable|string|max:7',
            'secondary_color' => 'nullable|string|max:7',
            'custom_css' => 'nullable|string',
            'presentation' => 'nullable|string',
            'working_hours' => 'nullable|array',
            'map_iframe' => 'nullable|string',
            'currency' => 'required|string|max:3',
            'usd_exchange_rate' => 'required|numeric|min:0',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:255',
            'services' => 'nullable|array',
            'services.*.id' => 'nullable',
            'services.*.name' => 'required|string|max:255',
            'services.*.description' => 'nullable|string',
            'services.*.icon' => 'nullable|string|max:255',
        ]);

        // Handle logo file upload
        if ($request->hasFile('logo_file')) {
            // Delete old logo if it exists in local storage
            if ($store->logo && str_starts_with($store->logo, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $store->logo);
                Storage::disk('public')->delete($oldPath);
            }
            $logoPath = $request->file('logo_file')->store('stores/logos', 'public');
            $validated['logo'] = Storage::url($logoPath);
        }

        // Handle banner file upload
        if ($request->hasFile('banner_file')) {
            // Delete old banner if it exists in local storage
            if ($store->banner && str_starts_with($store->banner, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $store->banner);
                Storage::disk('public')->delete($oldPath);
            }
            $bannerPath = $request->file('banner_file')->store('stores/banners', 'public');
            $validated['banner'] = Storage::url($bannerPath);
        }

        // Update the store details
        $store->fill(collect($validated)->except(['logo_file', 'banner_file', 'services'])->toArray());
        $store->save();

        // Handle store services offered
        $servicesData = $request->input('services', []);
        $sentServiceIds = collect($servicesData)->pluck('id')->filter()->toArray();

        // Delete services not sent in the update
        $store->services()->whereNotIn('id', $sentServiceIds)->delete();

        // Update existing services and insert new ones
        foreach ($servicesData as $service) {
            if (isset($service['id']) && $service['id'] > 0) {
                $store->services()->where('id', $service['id'])->update([
                    'name' => $service['name'],
                    'description' => $service['description'] ?? '',
                    'icon' => $service['icon'] ?? 'Sparkles',
                ]);
            } else {
                $store->services()->create([
                    'name' => $service['name'],
                    'description' => $service['description'] ?? '',
                    'icon' => $service['icon'] ?? 'Sparkles',
                ]);
            }
        }

        return redirect()->route('store.settings.edit', ['store_id' => $store->id])->with([
            'status' => 'success',
            'message' => 'Los datos del concesionario han sido actualizados con éxito.',
        ]);
    }
}
