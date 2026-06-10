<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    /**
     * Display a listing of the stores authorized for the authenticated user.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Retrieve stores with their services relation
        $stores = $user->stores()->with('services')->get();

        return response()->json([
            'data' => $stores
        ]);
    }

    /**
     * Display the specified store.
     */
    public function show(Request $request, Store $store)
    {
        $user = $request->user();

        // Check if the user has access to this store
        $hasAccess = $user->stores()->where('stores.id', $store->id)->exists();

        if (!$hasAccess) {
            return response()->json([
                'message' => 'No tienes acceso a este concesionario.'
            ], 403);
        }

        // Eager load services
        $store->load('services');

        return response()->json([
            'data' => $store
        ]);
    }
}
