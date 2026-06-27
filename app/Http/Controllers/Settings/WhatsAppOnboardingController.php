<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Services\MetaCommerceService;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\View\View;

class WhatsAppOnboardingController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct(
        protected MetaCommerceService $metaCommerceService
    ) {}

    /**
     * Show the WhatsApp Catalog onboarding and status page.
     */
    public function showOnboarding(Request $request): View
    {
        $user = $request->user();
        $store = $user->stores()
            ->wherePivotIn('role', ['owner', 'manager'])
            ->first();

        if (! $store) {
            abort(403, 'No tienes permisos para configurar la integración de WhatsApp.');
        }

        $clientId = config('services.meta.client_id');
        $redirectUri = config('services.meta.redirect_uri') ?: route('store.whatsapp.callback');

        $oauthUrl = null;
        if (! empty($clientId)) {
            $state = encrypt([
                'store_id' => $store->id,
                'user_id' => $user->id,
            ]);

            $oauthUrl = 'https://www.facebook.com/v19.0/dialog/oauth?'.http_build_query([
                'client_id' => $clientId,
                'redirect_uri' => $redirectUri,
                'scope' => 'catalog_management',
                'response_type' => 'code',
                'state' => $state,
            ]);
        }

        $isConfigured = ! empty($store->whatsapp_catalog_id) && ! empty($store->whatsapp_access_token);

        return view('settings.whatsapp_onboarding', [
            'store' => $store,
            'oauthUrl' => $oauthUrl,
            'isConfigured' => $isConfigured,
            'step' => 'index',
            'catalogs' => [],
        ]);
    }

    /**
     * Handle the Facebook Login OAuth callback.
     */
    public function callback(Request $request): View|RedirectResponse
    {
        try {
            $stateData = decrypt($request->input('state'));
            $storeId = $stateData['store_id'];
            $userId = $stateData['user_id'];
        } catch (\Exception $e) {
            return redirect()->route('store.whatsapp.onboarding')->with([
                'status' => 'error',
                'message' => 'El estado de la solicitud de autenticación es inválido o ha expirado.',
            ]);
        }

        $user = $request->user();
        if ($user->id !== $userId) {
            abort(403, 'Usuario no autorizado.');
        }

        $store = $user->stores()
            ->wherePivotIn('role', ['owner', 'manager'])
            ->where('stores.id', $storeId)
            ->firstOrFail();

        if ($request->has('error')) {
            return redirect()->route('store.whatsapp.onboarding')->with([
                'status' => 'error',
                'message' => 'Error de autenticación con Meta: '.$request->input('error_description', $request->input('error')),
            ]);
        }

        $code = $request->input('code');
        if (! $code) {
            return redirect()->route('store.whatsapp.onboarding')->with([
                'status' => 'error',
                'message' => 'No se recibió el código de autorización de Meta.',
            ]);
        }

        try {
            $redirectUri = config('services.meta.redirect_uri') ?: route('store.whatsapp.callback');
            $accessToken = $this->metaCommerceService->getAccessToken($code, $redirectUri);
            $businessId = $this->metaCommerceService->getBusinessId($accessToken);

            // Consult meta owned catalogs for the business manager
            $catalogs = $this->metaCommerceService->listCatalogs($businessId, $accessToken);

            // If no catalogs exist, create a new one automatically and complete onboarding
            if (empty($catalogs)) {
                $catalogName = 'AutoDealer - '.$store->name;
                $catalogId = $this->metaCommerceService->createCatalog($businessId, $catalogName, $accessToken);

                $store->update([
                    'whatsapp_access_token' => $accessToken,
                    'whatsapp_business_id' => $businessId,
                    'whatsapp_catalog_id' => $catalogId,
                ]);

                return redirect()->route('store.whatsapp.onboarding')->with([
                    'status' => 'success',
                    'message' => '¡Integración exitosa! No se encontraron catálogos existentes, por lo que creamos uno nuevo llamado "'.$catalogName.'" automáticamente.',
                ]);
            }

            // Save the current state in store db to enable subsequent operations
            $store->update([
                'whatsapp_access_token' => $accessToken,
                'whatsapp_business_id' => $businessId,
            ]);

            $isConfigured = ! empty($store->whatsapp_catalog_id) && ! empty($store->whatsapp_access_token);

            return view('settings.whatsapp_onboarding', [
                'store' => $store,
                'catalogs' => $catalogs,
                'step' => 'select_catalog',
                'oauthUrl' => null,
                'isConfigured' => $isConfigured,
            ]);

        } catch (RequestException $e) {
            $errorData = $e->response->json();
            $errMsg = $errorData['error']['error_user_msg'] ?? $errorData['error']['message'] ?? 'Error al comunicarse con Meta Graph API.';
            Log::error('Meta Commerce OAuth error: '.$e->getMessage(), ['response' => $errorData]);

            return redirect()->route('store.whatsapp.onboarding')->with([
                'status' => 'error',
                'message' => 'Error de Meta (400): '.$errMsg,
            ]);
        } catch (\Exception $e) {
            Log::error('Meta Commerce Onboarding callback error: '.$e->getMessage());

            return redirect()->route('store.whatsapp.onboarding')->with([
                'status' => 'error',
                'message' => 'Error de configuración: '.$e->getMessage(),
            ]);
        }
    }

    /**
     * Select an existing catalog to bind to the store.
     */
    public function selectCatalog(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'catalog_id' => 'required|string|max:255',
        ]);

        $user = $request->user();
        $store = $user->stores()
            ->wherePivotIn('role', ['owner', 'manager'])
            ->firstOrFail();

        if (empty($store->whatsapp_access_token)) {
            return redirect()->route('store.whatsapp.onboarding')->with([
                'status' => 'error',
                'message' => 'Debe autenticarse con Facebook antes de seleccionar un catálogo.',
            ]);
        }

        $store->update([
            'whatsapp_catalog_id' => $validated['catalog_id'],
        ]);

        return redirect()->route('store.whatsapp.onboarding')->with([
            'status' => 'success',
            'message' => '¡Catálogo vinculado con éxito! Tus vehículos ahora se sincronizarán con WhatsApp.',
        ]);
    }

    /**
     * Create a brand new catalog and bind it to the store.
     */
    public function createCatalog(Request $request): RedirectResponse
    {
        $user = $request->user();
        $store = $user->stores()
            ->wherePivotIn('role', ['owner', 'manager'])
            ->firstOrFail();

        if (empty($store->whatsapp_access_token) || empty($store->whatsapp_business_id)) {
            return redirect()->route('store.whatsapp.onboarding')->with([
                'status' => 'error',
                'message' => 'Debe autenticarse con Facebook antes de crear un catálogo.',
            ]);
        }

        try {
            $catalogName = 'AutoDealer - '.$store->name;
            $catalogId = $this->metaCommerceService->createCatalog(
                $store->whatsapp_business_id,
                $catalogName,
                $store->whatsapp_access_token
            );

            $store->update([
                'whatsapp_catalog_id' => $catalogId,
            ]);

            return redirect()->route('store.whatsapp.onboarding')->with([
                'status' => 'success',
                'message' => '¡Catálogo "'.$catalogName.'" creado y vinculado con éxito!',
            ]);
        } catch (RequestException $e) {
            $errorData = $e->response->json();
            $errMsg = $errorData['error']['error_user_msg'] ?? $errorData['error']['message'] ?? 'Error al crear el catálogo en Meta.';
            Log::error('Meta Commerce Create Catalog error: '.$e->getMessage(), ['response' => $errorData]);

            return redirect()->route('store.whatsapp.onboarding')->with([
                'status' => 'error',
                'message' => 'Error de Meta (400): '.$errMsg,
            ]);
        } catch (\Exception $e) {
            return redirect()->route('store.whatsapp.onboarding')->with([
                'status' => 'error',
                'message' => 'No se pudo crear el catálogo de productos: '.$e->getMessage(),
            ]);
        }
    }

    /**
     * Disconnect the WhatsApp catalog integration.
     */
    public function disconnect(Request $request): RedirectResponse
    {
        $user = $request->user();
        $store = $user->stores()
            ->wherePivotIn('role', ['owner', 'manager'])
            ->firstOrFail();

        $store->update([
            'whatsapp_catalog_id' => null,
            'whatsapp_access_token' => null,
            'whatsapp_business_id' => null,
        ]);

        return redirect()->route('store.whatsapp.onboarding')->with([
            'status' => 'success',
            'message' => 'La integración de Catálogo de WhatsApp ha sido desconectada.',
        ]);
    }
}
