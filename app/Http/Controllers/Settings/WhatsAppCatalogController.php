<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Services\MetaApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WhatsAppCatalogController extends Controller
{
    protected MetaApiService $metaApiService;

    public function __construct(MetaApiService $metaApiService)
    {
        $this->metaApiService = $metaApiService;
    }

    /**
     * Redirect the user to the Meta OAuth login page.
     */
    public function connect(Request $request)
    {
        $storeId = $request->input('store_id');
        $user = $request->user();

        // Verify that user has access to this store and is owner/manager
        $store = $user->stores()->where('stores.id', $storeId)->firstOrFail();
        if ($store->pivot->role !== 'owner' && $store->pivot->role !== 'manager') {
            abort(403, 'No tienes permisos para configurar este concesionario.');
        }

        $redirectUri = route('settings.whatsapp.callback');
        $authUrl = $this->metaApiService->getAuthUrl($storeId, $redirectUri);

        return redirect()->away($authUrl);
    }

    /**
     * Handle the callback redirection from Meta OAuth.
     */
    public function callback(Request $request)
    {
        $code = $request->query('code');
        $storeId = $request->query('state'); // State contains store ID passed in connect
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login')->with([
                'status' => 'error',
                'message' => 'Sesión expirada. Por favor, inicia sesión de nuevo.',
            ]);
        }

        if (! $code || ! $storeId) {
            return redirect()->route('store.settings.edit')->with([
                'status' => 'error',
                'message' => 'Falta código de autorización o estado en la respuesta de Meta.',
            ]);
        }

        // Verify that user has access to this store and is owner/manager
        $store = $user->stores()->where('stores.id', $storeId)->first();
        if (! $store || ($store->pivot->role !== 'owner' && $store->pivot->role !== 'manager')) {
            return redirect()->route('store.settings.edit')->with([
                'status' => 'error',
                'message' => 'No autorizado para configurar este concesionario.',
            ]);
        }

        try {
            $redirectUri = route('settings.whatsapp.callback');
            $longLivedToken = $this->metaApiService->exchangeCodeForToken($code, $redirectUri);

            // Save the token
            $store->update([
                'whatsapp_access_token' => $longLivedToken,
            ]);

            return redirect()->route('store.settings.edit', ['store_id' => $store->id])->with([
                'status' => 'success',
                'message' => 'Cuenta de Meta conectada con éxito. Selecciona un catálogo para habilitar la sincronización.',
            ]);
        } catch (\Exception $e) {
            Log::error('WhatsAppCatalogController Callback Error: '.$e->getMessage());

            return redirect()->route('store.settings.edit', ['store_id' => $storeId])->with([
                'status' => 'error',
                'message' => 'Error al conectar con Meta: '.$e->getMessage(),
            ]);
        }
    }

    /**
     * Disconnect WhatsApp/Meta catalog integration.
     */
    public function disconnect(Request $request)
    {
        $storeId = $request->input('store_id');
        $user = $request->user();

        $store = $user->stores()->where('stores.id', $storeId)->firstOrFail();
        if ($store->pivot->role !== 'owner' && $store->pivot->role !== 'manager') {
            abort(403, 'No tienes permisos.');
        }

        $store->update([
            'whatsapp_access_token' => null,
            'whatsapp_catalog_id' => null,
            'whatsapp_catalog_phone' => null,
        ]);

        return redirect()->route('store.settings.edit', ['store_id' => $store->id])->with([
            'status' => 'success',
            'message' => 'Sincronización de WhatsApp desvinculada correctamente.',
        ]);
    }

    /**
     * Get list of catalogs grouped by business for the linked access token.
     */
    public function listCatalogs(Request $request)
    {
        $storeId = $request->input('store_id');
        $user = $request->user();

        $store = $user->stores()->where('stores.id', $storeId)->firstOrFail();
        if ($store->pivot->role !== 'owner' && $store->pivot->role !== 'manager') {
            abort(403, 'No tienes permisos.');
        }

        $token = $store->whatsapp_access_token;
        if (! $token) {
            return response()->json(['error' => 'No hay cuenta de Meta vinculada.'], 400);
        }

        try {
            $api = $this->metaApiService->withToken($token);
            $businesses = $api->getBusinesses();
            $groupedCatalogs = [];

            foreach ($businesses as $business) {
                try {
                    $catalogs = $api->getCatalogs($business['id']);
                    if (! empty($catalogs)) {
                        $groupedCatalogs[] = [
                            'business_id' => $business['id'],
                            'business_name' => $business['name'],
                            'catalogs' => array_map(function ($c) {
                                return [
                                    'id' => $c['id'],
                                    'name' => $c['name'],
                                ];
                            }, $catalogs),
                        ];
                    }
                } catch (\Exception $e) {
                    Log::warning("WhatsAppCatalogController - Error loading catalogs for business {$business['id']}: ".$e->getMessage());
                }
            }

            return response()->json([
                'businesses' => $groupedCatalogs,
            ]);
        } catch (\Exception $e) {
            Log::error('WhatsAppCatalogController - listCatalogs Error: '.$e->getMessage());

            return response()->json(['error' => 'Error al consultar catálogos: '.$e->getMessage()], 500);
        }
    }

    /**
     * Save selected catalog configuration.
     */
    public function selectCatalog(Request $request)
    {
        $storeId = $request->input('store_id');
        $catalogId = $request->input('whatsapp_catalog_id');
        $catalogPhone = $request->input('whatsapp_catalog_phone');
        $user = $request->user();

        Log::info('WhatsAppCatalogController@selectCatalog parameters', [
            'store_id' => $storeId,
            'whatsapp_catalog_id' => $catalogId,
            'whatsapp_catalog_phone' => $catalogPhone,
        ]);

        $userStore = $user->stores()->where('stores.id', $storeId)->firstOrFail();
        if ($userStore->pivot->role !== 'owner' && $userStore->pivot->role !== 'manager') {
            abort(403, 'No tienes permisos.');
        }

        $request->validate([
            'whatsapp_catalog_id' => 'required|string',
            'whatsapp_catalog_phone' => 'nullable|string|max:255',
        ]);

        try {
            // Retrieve clean instance directly from DB to avoid BelongsToMany pivot-update side effects
            $store = Store::findOrFail($storeId);
            $store->update([
                'whatsapp_catalog_id' => $catalogId,
                'whatsapp_catalog_phone' => $catalogPhone,
            ]);

            Log::info('WhatsAppCatalogController@selectCatalog saved successfully', [
                'whatsapp_catalog_id' => $store->whatsapp_catalog_id,
                'whatsapp_catalog_phone' => $store->whatsapp_catalog_phone,
            ]);
        } catch (\Exception $e) {
            Log::error('WhatsAppCatalogController@selectCatalog error: '.$e->getMessage());

            return redirect()->route('store.settings.edit', ['store_id' => $storeId])->with([
                'status' => 'error',
                'message' => 'Error al guardar el catálogo: '.$e->getMessage(),
            ]);
        }

        return redirect()->route('store.settings.edit', ['store_id' => $storeId])->with([
            'status' => 'success',
            'message' => 'Catálogo de WhatsApp guardado y activado correctamente.',
        ]);
    }

    /**
     * Sync all vehicles of the store in bulk.
     */
    public function syncFullStock(Request $request)
    {
        $storeId = $request->input('store_id');
        $user = $request->user();

        $store = $user->stores()->where('stores.id', $storeId)->firstOrFail();
        if ($store->pivot->role !== 'owner' && $store->pivot->role !== 'manager') {
            abort(403, 'No tienes permisos.');
        }

        if (! $store->whatsapp_access_token || ! $store->whatsapp_catalog_id) {
            return redirect()->route('store.settings.edit', ['store_id' => $store->id])->with([
                'status' => 'error',
                'message' => 'El catálogo de WhatsApp no está completamente configurado.',
            ]);
        }

        try {
            $api = $this->metaApiService->withToken($store->whatsapp_access_token);
            $totalSynced = $api->syncAllVehicles($store);

            return redirect()->route('store.settings.edit', ['store_id' => $store->id])->with([
                'status' => 'success',
                'message' => "Sincronización completada con éxito. Se sincronizaron {$totalSynced} vehículos en tu catálogo.",
            ]);
        } catch (\Exception $e) {
            Log::error('WhatsAppCatalogController - syncFullStock Error: '.$e->getMessage());

            return redirect()->route('store.settings.edit', ['store_id' => $store->id])->with([
                'status' => 'error',
                'message' => 'Error al sincronizar stock: '.$e->getMessage(),
            ]);
        }
    }
}
