<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Store;
use App\Models\Subscription;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    /**
     * Show the store creation onboarding page.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        // If user already has stores, redirect to dashboard
        if ($user->stores()->exists()) {
            return to_route('dashboard');
        }

        return Inertia::render('onboarding/store');
    }

    /**
     * Handle the creation of the first store during onboarding.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'province' => 'required|string|max:100',
            'city'     => 'required|string|max:100',
            'address'  => 'required|string|max:500',
            'phone'    => 'nullable|string|max:30',
            'email'    => 'nullable|email|max:255',
            'role'     => 'required|in:owner,manager',
        ]);

        $user = $request->user();

        // Prevent creating duplicate stores via double-submit
        if ($user->stores()->exists()) {
            return to_route('dashboard');
        }

        // Generate unique slug from name
        $baseSlug = Str::slug($request->name);
        $slug = $baseSlug;
        $counter = 1;
        while (Store::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter++;
        }

        // Create the store with basic data; user will complete the rest via settings
        $store = Store::create([
            'name'     => $request->name,
            'slug'     => $slug,
            'address'  => $request->address,
            'province' => $request->province,
            'city'     => $request->city,
            'phone'    => $request->phone,
            'email'    => $request->email,
        ]);

        // Attach user with indicated role
        $user->stores()->attach($store->id, ['role' => $request->role]);

        // Assign default plan trial subscription
        $defaultPlan = Plan::where('is_default', true)->where('is_active', true)->first();

        if ($defaultPlan) {
            Subscription::create([
                'store_id'      => $store->id,
                'plan_id'       => $defaultPlan->id,
                'status'        => 'trialing',
                'trial_ends_at' => now()->addDays($defaultPlan->trial_days),
                'starts_at'     => now(),
            ]);
        }

        return to_route('dashboard');
    }
}
