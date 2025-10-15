<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $currentWorkingGroup = $request->attributes->get('workingGroup');

        // Get available working groups for the user
        $availableWorkingGroups = $user ? $user->memberships()
            ->with('workingGroup')
            ->where('status', \App\Enums\MembershipStatus::ACTIVE)
            ->get()
            ->map(function ($membership) use ($currentWorkingGroup) {
                return [
                    'id' => $membership->workingGroup->id,
                    'name' => $membership->workingGroup->name,
                    'type' => $membership->workingGroup->type->value,
                    'role' => $membership->role->value,
                    'is_default' => $membership->is_default,
                ];
            }) : [];

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'currentWorkingGroup' => $currentWorkingGroup ? [
                'id' => $currentWorkingGroup->id,
                'name' => $currentWorkingGroup->name,
                'type' => $currentWorkingGroup->type->value,
                'status' => $currentWorkingGroup->status->value,
            ] : null,
            'availableWorkingGroups' => $availableWorkingGroups,
        ];
    }
}
