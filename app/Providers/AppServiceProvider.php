<?php

namespace App\Providers;

use App\Support\WorkingGroupContext;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Spatie\Activitylog\Models\Activity;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(WorkingGroupContext::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Activity::saving(function (Activity $activity): void {
            if (! app()->runningInConsole()) {
                $activity->properties = collect($activity->properties ?? [])
                    ->merge([
                        'ip' => Request::ip(),
                        'user_agent' => Request::userAgent(),
                    ]);
            }

            $activity->group_id ??= app(WorkingGroupContext::class)->currentId();

            if (! $activity->causer && Auth::check()) {
                $activity->causer()->associate(Auth::user());
            }
        });
    }
}
