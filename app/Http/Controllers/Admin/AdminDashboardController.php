<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    /**
     * Show the admin dashboard.
     */
    public function index(Request $request): Response
    {
        $stats = [
            'stores_count' => Store::count(),
            'users_count' => User::count(),
            'vehicles_count' => Vehicle::count(),
        ];

        // Fetch stores with their vehicle count
        $stores = Store::withCount('vehicles')
            ->orderBy('vehicles_count', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($store) {
                return [
                    'id' => $store->id,
                    'name' => $store->name,
                    'slug' => $store->slug,
                    'vehicles_count' => $store->vehicles_count,
                ];
            });

        // Fetch recent users
        $recentUsers = User::orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_superadmin' => $user->is_superadmin,
                    'created_at' => $user->created_at->format('Y-m-d H:i'),
                ];
            });

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
            'stores' => $stores,
            'recentUsers' => $recentUsers,
        ]);
    }
}
