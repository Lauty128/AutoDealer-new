<?php

namespace App\Services;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

class MetaCommerceService
{
    protected string $baseUrl = 'https://graph.facebook.com/v19.0';

    /**
     * Exchange the OAuth code for a User Access Token.
     *
     * @throws RequestException
     */
    public function getAccessToken(string $code, string $redirectUri): string
    {
        $clientId = config('services.meta.client_id');
        $clientSecret = config('services.meta.client_secret');

        $response = Http::throw()
            ->get("{$this->baseUrl}/oauth/access_token", [
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
                'redirect_uri' => $redirectUri,
                'code' => $code,
            ]);

        return $response->json('access_token');
    }

    /**
     * Get the Business Manager ID for the user.
     *
     * @throws RequestException
     * @throws \Exception
     */
    public function getBusinessId(string $accessToken): string
    {
        $response = Http::withToken($accessToken)
            ->throw()
            ->get("{$this->baseUrl}/me/businesses");

        $data = $response->json('data');

        if (empty($data)) {
            throw new \Exception('No se encontraron Cuentas Comerciales (Business Manager) asociadas a tu cuenta de Facebook.');
        }

        // Return the first business ID found
        return $data[0]['id'];
    }

    /**
     * List product catalogs owned by the business.
     *
     * @throws RequestException
     */
    public function listCatalogs(string $businessId, string $accessToken): array
    {
        $response = Http::withToken($accessToken)
            ->throw()
            ->get("{$this->baseUrl}/{$businessId}/owned_product_catalogs");

        return $response->json('data') ?? [];
    }

    /**
     * Create a new product catalog.
     *
     * @throws RequestException
     */
    public function createCatalog(string $businessId, string $name, string $accessToken): string
    {
        $response = Http::withToken($accessToken)
            ->throw()
            ->post("{$this->baseUrl}/{$businessId}/owned_product_catalogs", [
                'name' => $name,
                'vertical' => 'COMMERCE',
            ]);

        return $response->json('id');
    }
}
