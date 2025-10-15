<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\SetCurrentWorkingGroup::class,
            \App\Http\Middleware\SecureHeaders::class,
            \App\Http\Middleware\TrackLastLogin::class,
            \App\Http\Middleware\EnsureProfileIsComplete::class,
        ]);

        // Register role middleware alias
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);
    })
    ->withProviders([
        \App\Providers\AppServiceProvider::class,
        \App\Providers\AuthServiceProvider::class,
        \App\Providers\FeatureServiceProvider::class,
        \App\Providers\HorizonServiceProvider::class,
    ])
    ->withExceptions(function (Exceptions $exceptions): void {
        if (config('sentry.dsn')) {
            $exceptions->reportable(function (\Throwable $throwable): void {
                if (app()->bound('sentry')) {
                    app('sentry')->captureException($throwable);
                }
            });
        }

        // Custom 404 error page
        $exceptions->render(function (NotFoundHttpException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Page not found'], 404);
            }
            return Inertia::render('Errors/404')->toResponse($request)->setStatusCode(404);
        });

        // Custom 403 error page
        $exceptions->render(function (AccessDeniedHttpException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Access denied'], 403);
            }
            return Inertia::render('Errors/403')->toResponse($request)->setStatusCode(403);
        });
    })->create();
