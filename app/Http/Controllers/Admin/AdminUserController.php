<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(Request $request): Response
    {
        $query = User::with('stores');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('role') && $request->input('role') !== '') {
            if ($request->input('role') === 'admin') {
                $query->where('is_superadmin', true);
            } elseif ($request->input('role') === 'user') {
                $query->where('is_superadmin', false);
            }
        }

        $users = $query->orderBy('name')->paginate(10)->withQueryString();
        $stores = Store::orderBy('name')->get();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'stores' => $stores,
            'filters' => [
                'search' => $request->input('search', ''),
                'role' => $request->input('role', ''),
            ],
            'status' => session('status'),
            'message' => session('message'),
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'is_superadmin' => 'boolean',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'is_superadmin' => $request->boolean('is_superadmin'),
        ]);

        if ($request->has('stores')) {
            $storesData = [];
            foreach ($request->input('stores') as $s) {
                if (! empty($s['store_id'])) {
                    $storesData[$s['store_id']] = ['role' => $s['role'] ?? 'editor'];
                }
            }
            $user->stores()->sync($storesData);
        }

        return redirect()->route('admin.users.index')->with([
            'status' => 'success',
            'message' => 'Usuario creado correctamente.',
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$id,
            'password' => 'nullable|string|min:8',
            'is_superadmin' => 'boolean',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'is_superadmin' => $request->boolean('is_superadmin'),
        ];

        if ($request->filled('password')) {
            $updateData['password'] = bcrypt($request->input('password'));
        }

        $user->update($updateData);

        if ($request->has('stores')) {
            $storesData = [];
            foreach ($request->input('stores') as $s) {
                if (! empty($s['store_id'])) {
                    $storesData[$s['store_id']] = ['role' => $s['role'] ?? 'editor'];
                }
            }
            $user->stores()->sync($storesData);
        } else {
            $user->stores()->detach();
        }

        return redirect()->route('admin.users.index')->with([
            'status' => 'success',
            'message' => 'Usuario actualizado correctamente.',
        ]);
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if ($user->id === auth()->id()) {
            return redirect()->route('admin.users.index')->with([
                'status' => 'error',
                'message' => 'No puedes eliminar tu propio usuario de administrador.',
            ]);
        }

        $user->delete();

        return redirect()->route('admin.users.index')->with([
            'status' => 'success',
            'message' => 'Usuario eliminado correctamente.',
        ]);
    }
}
