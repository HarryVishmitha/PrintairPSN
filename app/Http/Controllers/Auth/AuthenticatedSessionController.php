<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Get the authenticated user
        $user = $request->user();

        // Determine redirect URL based on user's highest role
        $redirectUrl = $this->getRedirectUrlByRole($user);

        return redirect()->intended($redirectUrl);
    }

    /**
     * Get the redirect URL based on user's role
     */
    private function getRedirectUrlByRole($user): string
    {
        // Check roles in priority order (highest to lowest)
        if ($user->hasRole(\App\Enums\WorkingGroupRole::SUPER_ADMIN->value)) {
            return route('admin.dashboard', absolute: false);
        }

        if ($user->hasRole(\App\Enums\WorkingGroupRole::ADMIN->value)) {
            return route('admin.dashboard', absolute: false);
        }

        if ($user->hasRole(\App\Enums\WorkingGroupRole::MANAGER->value)) {
            return route('manager.dashboard', absolute: false);
        }

        if ($user->hasRole(\App\Enums\WorkingGroupRole::DESIGNER->value)) {
            return route('designer.dashboard', absolute: false);
        }

        if ($user->hasRole(\App\Enums\WorkingGroupRole::MARKETING->value)) {
            return route('marketing.dashboard', absolute: false);
        }

        // Default to member dashboard or general dashboard
        if ($user->hasRole(\App\Enums\WorkingGroupRole::MEMBER->value)) {
            return route('member.dashboard', absolute: false);
        }

        // Fallback to default dashboard
        return route('dashboard', absolute: false);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
