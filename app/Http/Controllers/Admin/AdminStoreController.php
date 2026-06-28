<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Store;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminStoreController extends Controller
{
    /**
     * Display a listing of the stores.
     */
    public function index(Request $request): Response
    {
        $query = Store::withCount('vehicles');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $stores = $query->orderBy('name')->paginate(10)->withQueryString();

        return Inertia::render('admin/stores/index', [
            'stores' => $stores,
            'filters' => [
                'search' => $request->input('search', ''),
            ],
            'status' => session('status'),
            'message' => session('message'),
        ]);
    }

    /**
     * Store a newly created store in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:stores,slug',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:255',
            'whatsapp' => 'nullable|string|max:255',
            'whatsapp_catalog_id' => 'nullable|string|max:255',
            'whatsapp_catalog_phone' => 'nullable|string|max:255',
            'instagram' => 'nullable|string|max:255',
            'facebook' => 'nullable|string|max:255',
            'tiktok' => 'nullable|string|max:255',
            'website' => 'nullable|string|max:255',
            'logo_file' => 'nullable|image|max:2048',
            'banner_file' => 'nullable|image|max:4096',
            'primary_color' => 'nullable|string|max:7',
            'secondary_color' => 'nullable|string|max:7',
            'presentation' => 'nullable|string',
            'custom_css' => 'nullable|string',
            'working_hours' => 'nullable|array',
            'map_iframe' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:255',
        ]);

        // Upload logo if sent
        if ($request->hasFile('logo_file')) {
            $logoPath = $request->file('logo_file')->store('stores/logos', 'public');
            $validated['logo'] = Storage::url($logoPath);
        }

        // Upload banner if sent
        if ($request->hasFile('banner_file')) {
            $bannerPath = $request->file('banner_file')->store('stores/banners', 'public');
            $validated['banner'] = Storage::url($bannerPath);
        }

        $store = Store::create(collect($validated)->except(['logo_file', 'banner_file'])->toArray());

        // Create default trialing subscription
        $defaultPlan = Plan::where('slug', 'premium')->first();
        if ($defaultPlan) {
            Subscription::create([
                'store_id' => $store->id,
                'plan_id' => $defaultPlan->id,
                'status' => 'trialing',
                'trial_ends_at' => now()->addDays($defaultPlan->trial_days),
            ]);
        }

        return redirect()->route('admin.stores.index')->with([
            'status' => 'success',
            'message' => 'Concesionario creado correctamente.',
        ]);
    }

    /**
     * Update the specified store in storage.
     */
    public function update(Request $request, $id)
    {
        $store = Store::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:stores,slug,'.$id,
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:255',
            'whatsapp' => 'nullable|string|max:255',
            'whatsapp_catalog_id' => 'nullable|string|max:255',
            'whatsapp_catalog_phone' => 'nullable|string|max:255',
            'instagram' => 'nullable|string|max:255',
            'facebook' => 'nullable|string|max:255',
            'tiktok' => 'nullable|string|max:255',
            'website' => 'nullable|string|max:255',
            'logo_file' => 'nullable|image|max:2048',
            'banner_file' => 'nullable|image|max:4096',
            'primary_color' => 'nullable|string|max:7',
            'secondary_color' => 'nullable|string|max:7',
            'presentation' => 'nullable|string',
            'custom_css' => 'nullable|string',
            'working_hours' => 'nullable|array',
            'map_iframe' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:255',
        ]);

        // Upload logo if sent
        if ($request->hasFile('logo_file')) {
            if ($store->logo && str_starts_with($store->logo, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $store->logo);
                Storage::disk('public')->delete($oldPath);
            }
            $logoPath = $request->file('logo_file')->store('stores/logos', 'public');
            $validated['logo'] = Storage::url($logoPath);
        }

        // Upload banner if sent
        if ($request->hasFile('banner_file')) {
            if ($store->banner && str_starts_with($store->banner, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $store->banner);
                Storage::disk('public')->delete($oldPath);
            }
            $bannerPath = $request->file('banner_file')->store('stores/banners', 'public');
            $validated['banner'] = Storage::url($bannerPath);
        }

        $store->update(collect($validated)->except(['logo_file', 'banner_file'])->toArray());

        return redirect()->route('admin.stores.index')->with([
            'status' => 'success',
            'message' => 'Concesionario actualizado correctamente.',
        ]);
    }

    /**
     * Remove the specified store from storage.
     */
    public function destroy($id)
    {
        $store = Store::findOrFail($id);

        // Delete uploaded files if they exist
        if ($store->logo && str_starts_with($store->logo, '/storage/')) {
            $oldPath = str_replace('/storage/', '', $store->logo);
            Storage::disk('public')->delete($oldPath);
        }
        if ($store->banner && str_starts_with($store->banner, '/storage/')) {
            $oldPath = str_replace('/storage/', '', $store->banner);
            Storage::disk('public')->delete($oldPath);
        }

        $store->delete();

        return redirect()->route('admin.stores.index')->with([
            'status' => 'success',
            'message' => 'Concesionario eliminado correctamente.',
        ]);
    }

    /**
     * Impersonate a store owner.
     */
    public function impersonate(Request $request, $id)
    {
        $store = Store::findOrFail($id);

        $user = $request->user();
        if ($user) {
            $user->startImpersonation($store->id);
        }

        // Save simulated store ID in session
        session(['simulated_store_id' => $store->id]);

        return redirect()->route('dashboard');
    }
}
