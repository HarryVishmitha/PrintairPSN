<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogActivityMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log for authenticated users
        if (auth()->check()) {
            $user = auth()->user();
            $method = $request->method();
            $path = $request->path();
            
            // Log specific routes
            if ($this->shouldLog($method, $path)) {
                $this->logActivity($user, $method, $path, $request);
            }
        }

        return $response;
    }

    /**
     * Determine if the request should be logged
     */
    private function shouldLog(string $method, string $path): bool
    {
        // Log POST, PUT, PATCH, DELETE requests
        if (!in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            return false;
        }

        // Exclude certain paths
        $excludePaths = [
            'notifications/mark-read',
            'notifications/mark-all-read',
            '_ignition',
            'livewire',
        ];

        foreach ($excludePaths as $excludePath) {
            if (str_contains($path, $excludePath)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Log the activity
     */
    private function logActivity($user, string $method, string $path, Request $request): void
    {
        $action = $this->getActionFromPath($method, $path);
        
        if ($action) {
            activity()
                ->causedBy($user)
                ->withProperties([
                    'method' => $method,
                    'path' => $path,
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ])
                ->log($action);
        }
    }

    /**
     * Get a descriptive action from the path
     */
    private function getActionFromPath(string $method, string $path): ?string
    {
        // Admin actions
        if (str_starts_with($path, 'admin/')) {
            if (str_contains($path, 'users')) {
                return match($method) {
                    'POST' => 'admin_created_user',
                    'PUT', 'PATCH' => 'admin_updated_user',
                    'DELETE' => 'admin_deleted_user',
                    default => null,
                };
            }

            if (str_contains($path, 'working-groups')) {
                return match($method) {
                    'POST' => 'admin_created_working_group',
                    'PUT', 'PATCH' => 'admin_updated_working_group',
                    'DELETE' => 'admin_deleted_working_group',
                    default => null,
                };
            }
        }

        // Login/Logout
        if ($path === 'login') {
            return 'user_logged_in';
        }

        if ($path === 'logout') {
            return 'user_logged_out';
        }

        // Profile updates
        if (str_contains($path, 'profile')) {
            return match($method) {
                'PATCH' => 'user_updated_profile',
                'DELETE' => 'user_deleted_account',
                default => null,
            };
        }

        return null;
    }
}
