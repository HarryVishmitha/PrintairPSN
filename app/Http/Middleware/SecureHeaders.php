<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SecureHeaders
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        $response->headers->set('X-XSS-Protection', '0');

        if (app()->environment('production')) {
            $response->headers->set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
        }

        // Build CSP directive based on environment
        $cspParts = [
            "default-src 'self'",
            "img-src 'self' data: https:",
            "font-src 'self' https://fonts.bunny.net https://fonts.gstatic.com",
            "style-src 'self' 'unsafe-inline' https://fonts.bunny.net https://fonts.googleapis.com",
        ];

        // In development, allow Vite dev server
        if (app()->environment('local', 'development')) {
            // Vite typically runs on port 5173, but allow common dev ports (5173-5174)
            $cspParts[] = "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:5173 http://127.0.0.1:5173 http://localhost:5174 http://127.0.0.1:5174";
            $cspParts[] = "connect-src 'self' ws://localhost:5173 ws://127.0.0.1:5173 ws://localhost:5174 ws://127.0.0.1:5174 http://localhost:5173 http://127.0.0.1:5173 http://localhost:5174 http://127.0.0.1:5174 https://api.iconify.design https://api.simplesvg.com https://api.unisvg.com";
        } else {
            $cspParts[] = "script-src 'self' 'unsafe-inline'";
            $cspParts[] = "connect-src 'self' https://api.iconify.design https://api.simplesvg.com https://api.unisvg.com";
        }

        $csp = implode('; ', $cspParts);
        $response->headers->set('Content-Security-Policy', $csp);

        return $response;
    }
}
