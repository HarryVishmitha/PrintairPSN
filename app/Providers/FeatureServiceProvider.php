<?php

namespace App\Providers;

use App\Http\Middleware\SetCurrentWorkingGroup;
use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class FeatureServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Feature::define(SetCurrentWorkingGroup::FEATURE_KEY, fn () => false);
    }
}
