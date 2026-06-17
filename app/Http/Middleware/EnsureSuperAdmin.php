<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuperAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::check()) {
            return redirect()->route('admin.login');
        }

        if (! Auth::user()->is_superadmin) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('admin.login')->withErrors([
                'email' => 'Acceso denegado. No tienes privilegios de administrador.',
            ]);
        }

        if ($request->hasSession() && $request->session()->has('simulated_store_id')) {
            $request->session()->forget('simulated_store_id');

            $user = Auth::user();
            if ($user) {
                $user->stopImpersonation();
            }
        }

        return $next($request);
    }
}
