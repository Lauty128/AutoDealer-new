<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminPlanController extends Controller
{
    /**
     * Display a listing of the plans.
     */
    public function index(Request $request): Response
    {
        $query = Plan::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $plans = $query->orderBy('created_at', 'desc')->paginate(10)->withQueryString();

        return Inertia::render('admin/plans/index', [
            'plans' => $plans,
            'filters' => [
                'search' => $request->input('search', ''),
            ],
            'status' => session('status'),
            'message' => session('message'),
        ]);
    }

    /**
     * Store a newly created plan.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'currency' => 'required|string|max:10',
            'billing_period' => 'required|string|in:monthly,yearly',
            'trial_days' => 'required|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $slug = Str::slug($validated['name']);
        
        // Ensure slug is unique, append a number if not
        $originalSlug = $slug;
        $count = 1;
        while (Plan::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count;
            $count++;
        }

        Plan::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'],
            'price' => $validated['price'],
            'currency' => $validated['currency'],
            'billing_period' => $validated['billing_period'],
            'trial_days' => $validated['trial_days'],
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('admin.plans.index')->with([
            'status' => 'success',
            'message' => 'Plan creado correctamente.',
        ]);
    }

    /**
     * Update the specified plan.
     */
    public function update(Request $request, $id)
    {
        $plan = Plan::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'currency' => 'required|string|max:10',
            'billing_period' => 'required|string|in:monthly,yearly',
            'trial_days' => 'required|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'currency' => $validated['currency'],
            'billing_period' => $validated['billing_period'],
            'trial_days' => $validated['trial_days'],
            'is_active' => $request->boolean('is_active'),
        ];

        // Only regenerate slug if name changes
        if ($plan->name !== $validated['name']) {
            $slug = Str::slug($validated['name']);
            $originalSlug = $slug;
            $count = 1;
            while (Plan::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                $slug = $originalSlug . '-' . $count;
                $count++;
            }
            $updateData['slug'] = $slug;
        }

        $plan->update($updateData);

        return redirect()->route('admin.plans.index')->with([
            'status' => 'success',
            'message' => 'Plan actualizado correctamente.',
        ]);
    }

    /**
     * Remove the specified plan.
     */
    public function destroy($id)
    {
        $plan = Plan::findOrFail($id);

        // Check if plan has active subscriptions
        if ($plan->subscriptions()->exists()) {
            return redirect()->route('admin.plans.index')->with([
                'status' => 'error',
                'message' => 'No se puede eliminar el plan porque tiene suscripciones asociadas.',
            ]);
        }

        try {
            $plan->delete();

            return redirect()->route('admin.plans.index')->with([
                'status' => 'success',
                'message' => 'Plan eliminado correctamente.',
            ]);
        } catch (QueryException $e) {
            return redirect()->route('admin.plans.index')->with([
                'status' => 'error',
                'message' => 'No se pudo eliminar el plan debido a un error de base de datos.',
            ]);
        }
    }
}
