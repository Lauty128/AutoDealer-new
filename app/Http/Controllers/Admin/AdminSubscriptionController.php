<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSubscriptionController extends Controller
{
    /**
     * Display subscriptions and payments.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');

        // Query subscriptions
        $subQuery = Subscription::with(['store.users', 'plan']);

        if (!empty($search)) {
            $subQuery->where(function ($query) use ($search) {
                $query->whereHas('store', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhereHas('users', function ($uq) use ($search) {
                            $uq->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            });
        }

        $subscriptions = $subQuery->orderBy('created_at', 'desc')
            ->paginate(10, ['*'], 'subs_page')
            ->withQueryString();

        // Query payments
        $payQuery = Payment::with(['store.users', 'subscription.plan']);

        if (!empty($search)) {
            $payQuery->where(function ($query) use ($search) {
                $query->whereHas('store', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhereHas('users', function ($uq) use ($search) {
                            $uq->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            });
        }

        $payments = $payQuery->orderBy('created_at', 'desc')
            ->paginate(10, ['*'], 'pays_page')
            ->withQueryString();

        $plans = Plan::all();

        return Inertia::render('admin/subscriptions/index', [
            'subscriptions' => $subscriptions,
            'payments' => $payments,
            'plans' => $plans,
            'filters' => [
                'search' => $search,
            ],
            'status' => session('status'),
            'message' => session('message'),
        ]);
    }

    /**
     * Update the specified subscription.
     */
    public function update(Request $request, $id)
    {
        $subscription = Subscription::findOrFail($id);

        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'status' => 'required|string|in:trialing,active,pending_payment,cancelled,expired',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
            'trial_ends_at' => 'nullable|date',
        ]);

        $updateData = [
            'plan_id' => $validated['plan_id'],
            'status' => $validated['status'],
            'starts_at' => $validated['starts_at'],
            'ends_at' => $validated['ends_at'],
            'trial_ends_at' => $validated['trial_ends_at'],
        ];

        // If status changes to cancelled, populate cancelled_at if not set
        if ($validated['status'] === 'cancelled') {
            $updateData['cancelled_at'] = $subscription->cancelled_at ?? now();
        } else {
            $updateData['cancelled_at'] = null;
        }

        $subscription->update($updateData);

        return redirect()->route('admin.subscriptions.index')->with([
            'status' => 'success',
            'message' => 'Suscripción actualizada correctamente.',
        ]);
    }
}
