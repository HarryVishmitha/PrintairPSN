<?php

namespace App\Providers;

use App\Enums\WorkingGroupRole;
use App\Models\Address;
use App\Models\Asset;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\PaymentIntent;
use App\Models\Quote;
use App\Models\User;
use App\Models\WorkingGroup;
use App\Models\WorkingGroupMembership;
use App\Policies\AddressPolicy;
use App\Policies\AssetPolicy;
use App\Policies\InvoicePolicy;
use App\Policies\OrderPolicy;
use App\Policies\PaymentIntentPolicy;
use App\Policies\QuotePolicy;
use App\Policies\WorkingGroupMembershipPolicy;
use App\Policies\WorkingGroupPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        WorkingGroup::class => WorkingGroupPolicy::class,
        WorkingGroupMembership::class => WorkingGroupMembershipPolicy::class,
        Order::class => OrderPolicy::class,
        Asset::class => AssetPolicy::class,
        Address::class => AddressPolicy::class,
        Quote::class => QuotePolicy::class,
        Invoice::class => InvoicePolicy::class,
        PaymentIntent::class => PaymentIntentPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        Gate::before(function (User $user) {
            return $user->hasRole(WorkingGroupRole::SUPER_ADMIN->value) ? true : null;
        });
    }
}
