<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Store;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
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
            'whatsapp_phone_number_id' => 'nullable|string|max:255',
            'whatsapp_catalog_id' => 'nullable|string|max:255',
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
            'whatsapp_phone_number_id' => 'nullable|string|max:255',
            'whatsapp_catalog_id' => 'nullable|string|max:255',
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

    /**
     * Request verification code for WhatsApp.
     */
    public function requestVerificationCode(Request $request, $id)
    {
        $store = Store::findOrFail($id);

        $validated = $request->validate([
            'whatsapp_phone_number_id' => 'required|string|max:255',
            'code_method' => 'required|string|in:SMS,VOICE',
        ]);

        $accessToken = config('services.meta.access_token');
        if (empty($accessToken)) {
            return response()->json([
                'status' => 'error',
                'message' => 'El token de acceso de Meta no está configurado globalmente.',
            ], 422);
        }

        $phoneId = $validated['whatsapp_phone_number_id'];
        $method = $validated['code_method'];

        $response = $this->getHttpClient($accessToken)
            ->post("https://graph.facebook.com/v18.0/{$phoneId}/request_code", [
                'code_method' => $method,
                'language' => 'es_ES',
            ]);

        if ($response->successful()) {
            $store->update([
                'whatsapp_phone_number_id' => $phoneId,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Código de verificación solicitado con éxito.',
            ]);
        }

        $errorData = $response->json();
        \Illuminate\Support\Facades\Log::error("Meta request_code failure for store {$id}: " . json_encode($errorData));
        $errorMessage = $errorData['error']['error_user_msg'] ?? $errorData['error']['message'] ?? 'Error al solicitar el código en Meta.';

        return response()->json([
            'status' => 'error',
            'message' => $errorMessage,
        ], 422);
    }

    /**
     * Verify OTP code and register with Cloud API, create catalog, and link to WABA.
     */
    public function verifyAndRegister(Request $request, $id)
    {
        $store = Store::findOrFail($id);

        $validated = $request->validate([
            'whatsapp_phone_number_id' => 'required|string|max:255',
            'code' => 'required|string|size:6',
            'pin' => 'required|string|size:6',
        ]);

        $accessToken = config('services.meta.access_token');
        $wabaId = config('services.meta.waba_id');
        $businessId = config('services.meta.business_id');

        if (empty($accessToken) || empty($wabaId) || empty($businessId)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Faltan configurar las credenciales globales de Meta (Token, WABA ID o Business ID).',
            ], 422);
        }

        $phoneId = $validated['whatsapp_phone_number_id'];
        $code = $validated['code'];
        $pin = $validated['pin'];

        // 1. Verify Code
        $verifyResponse = $this->getHttpClient($accessToken)
            ->post("https://graph.facebook.com/v18.0/{$phoneId}/verify_code", [
                'code' => $code,
            ]);

        if (!$verifyResponse->successful()) {
            $errorData = $verifyResponse->json();
            \Illuminate\Support\Facades\Log::error("Meta verify_code failure for store {$id}: " . json_encode($errorData));
            $msg = $errorData['error']['error_user_msg'] ?? $errorData['error']['message'] ?? 'El código de verificación es inválido o expiró.';
            return response()->json(['status' => 'error', 'message' => $msg], 422);
        }

        // 2. Register Phone Number for Cloud API
        $registerResponse = $this->getHttpClient($accessToken)
            ->post("https://graph.facebook.com/v18.0/{$phoneId}/register", [
                'messaging_product' => 'whatsapp',
                'pin' => $pin,
            ]);

        if (!$registerResponse->successful()) {
            $errorData = $registerResponse->json();
            \Illuminate\Support\Facades\Log::error("Meta register phone failure for store {$id}: " . json_encode($errorData));
            $msg = $errorData['error']['error_user_msg'] ?? $errorData['error']['message'] ?? 'Error al registrar el número en Meta.';
            return response()->json(['status' => 'error', 'message' => $msg], 422);
        }

        // 3. Create Product Catalog
        $catalogName = "Autodealer - " . $store->name;
        $catalogResponse = $this->getHttpClient($accessToken)
            ->post("https://graph.facebook.com/v18.0/{$businessId}/owned_product_catalogs", [
                'name' => $catalogName,
                'vertical' => 'COMMERCE',
            ]);

        if (!$catalogResponse->successful()) {
            $errorData = $catalogResponse->json();
            \Illuminate\Support\Facades\Log::error("Meta create catalog failure for store {$id}: " . json_encode($errorData));
            $msg = $errorData['error']['error_user_msg'] ?? $errorData['error']['message'] ?? 'Error al crear el catálogo de productos en Meta.';
            return response()->json(['status' => 'error', 'message' => $msg], 422);
        }

        $catalogId = $catalogResponse->json()['id'] ?? null;
        if (empty($catalogId)) {
            \Illuminate\Support\Facades\Log::error("Meta created catalog ID is empty for store {$id}");
            return response()->json([
                'status' => 'error',
                'message' => 'No se pudo obtener el ID del catálogo creado.',
            ], 422);
        }

        // 4. Link Catalog to WABA
        $linkResponse = $this->getHttpClient($accessToken)
            ->post("https://graph.facebook.com/v18.0/{$wabaId}/product_catalogs", [
                'catalog_id' => $catalogId,
            ]);

        if (!$linkResponse->successful()) {
            $errorData = $linkResponse->json();
            \Illuminate\Support\Facades\Log::error("Meta link catalog failure for store {$id}: " . json_encode($errorData));
            $msg = $errorData['error']['error_user_msg'] ?? $errorData['error']['message'] ?? 'Catálogo creado pero falló la vinculación con la cuenta de WhatsApp.';
            return response()->json(['status' => 'error', 'message' => $msg], 422);
        }

        // 5. Update Store record
        $store->update([
            'whatsapp_phone_number_id' => $phoneId,
            'whatsapp_catalog_id' => $catalogId,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Configuración de WhatsApp completada con éxito. Catálogo creado y enlazado.',
            'whatsapp_phone_number_id' => $phoneId,
            'whatsapp_catalog_id' => $catalogId,
        ]);
    }

    /**
     * Get configured Http client instance (bypasses SSL verification locally).
     */
    protected function getHttpClient(string $accessToken)
    {
        $http = Http::withToken($accessToken);
        if (config('app.env') === 'local') {
            $http->withoutVerifying();
        }
        return $http;
    }
}
