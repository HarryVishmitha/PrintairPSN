<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureProfileIsComplete
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Skip check if user is not authenticated
        if (!$user) {
            return $next($request);
        }

        // Skip check if already on profile edit page or logout route
        if ($request->routeIs('profile.edit') || 
            $request->routeIs('profile.update') || 
            $request->routeIs('logout')) {
            return $next($request);
        }

        // Check if user has completed their profile (phone number required)
        if (!$user->hasCompletedProfile()) {
            return redirect()->route('profile.edit')
                ->with('warning', 'Please complete your profile by adding your phone number to continue.');
        }

        return $next($request);
    }
}
