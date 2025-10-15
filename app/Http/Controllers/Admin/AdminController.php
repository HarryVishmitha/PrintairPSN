<?php

namespace App\Http\Controllers\Admin;

use App\Enums\MembershipStatus;
use App\Enums\WorkingGroupRole;
use App\Enums\WorkingGroupStatus;
use App\Enums\WorkingGroupType;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use App\Models\WorkingGroup;
use App\Models\WorkingGroupMembership;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function dashboard(): Response
    {
        $stats = [
            'totalUsers' => User::count(),
            'totalWorkingGroups' => WorkingGroup::count(),
            'activeMemberships' => WorkingGroupMembership::where('status', MembershipStatus::ACTIVE)->count(),
            'recentActivities' => ActivityLog::count(),
        ];

        $recentActivity = ActivityLog::with('causer')
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'description' => $activity->description,
                    'causer' => $activity->causer ? [
                        'name' => $activity->causer->name,
                    ] : null,
                    'created_at' => $activity->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentActivity' => $recentActivity,
        ]);
    }

    /**
     * Display a listing of working groups.
     */
    public function workingGroupsIndex(): Response
    {
        $workingGroups = WorkingGroup::withCount('memberships')
            ->with(['memberships' => function ($query) {
                $query->where('status', MembershipStatus::ACTIVE)->take(5);
            }])
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/WorkingGroups/Index', [
            'workingGroups' => $workingGroups,
        ]);
    }

    /**
     * Show the form for creating a new working group.
     */
    public function workingGroupsCreate(): Response
    {
        return Inertia::render('Admin/WorkingGroups/Create', [
            'types' => collect(WorkingGroupType::cases())->map(fn($type) => [
                'value' => $type->value,
                'label' => ucfirst($type->value),
            ]),
            'statuses' => collect(WorkingGroupStatus::cases())->map(fn($status) => [
                'value' => $status->value,
                'label' => ucfirst($status->value),
            ]),
        ]);
    }

    /**
     * Store a newly created working group in storage.
     */
    public function workingGroupsStore(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:working_groups,name'],
            'type' => ['required', Rule::in(array_column(WorkingGroupType::cases(), 'value'))],
            'status' => ['required', Rule::in(array_column(WorkingGroupStatus::cases(), 'value'))],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $workingGroup = WorkingGroup::create([
            'name' => $validated['name'],
            'type' => WorkingGroupType::from($validated['type']),
            'status' => WorkingGroupStatus::from($validated['status']),
            'description' => $validated['description'] ?? null,
            'settings' => [],
        ]);

        activity()
            ->performedOn($workingGroup)
            ->causedBy($request->user())
            ->log('created working group');

        return Redirect::route('admin.working-groups.index')
            ->with('success', 'Working group created successfully.');
    }

    /**
     * Show the form for editing the specified working group.
     */
    public function workingGroupsEdit(WorkingGroup $workingGroup): Response
    {
        $workingGroup->load(['memberships' => function ($query) {
            $query->with('user')->where('status', MembershipStatus::ACTIVE);
        }]);

        return Inertia::render('Admin/WorkingGroups/Edit', [
            'workingGroup' => $workingGroup,
            'types' => collect(WorkingGroupType::cases())->map(fn($type) => [
                'value' => $type->value,
                'label' => ucfirst($type->value),
            ]),
            'statuses' => collect(WorkingGroupStatus::cases())->map(fn($status) => [
                'value' => $status->value,
                'label' => ucfirst($status->value),
            ]),
        ]);
    }

    /**
     * Update the specified working group in storage.
     */
    public function workingGroupsUpdate(Request $request, WorkingGroup $workingGroup): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('working_groups', 'name')->ignore($workingGroup->id)],
            'type' => ['required', Rule::in(array_column(WorkingGroupType::cases(), 'value'))],
            'status' => ['required', Rule::in(array_column(WorkingGroupStatus::cases(), 'value'))],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $workingGroup->update([
            'name' => $validated['name'],
            'type' => WorkingGroupType::from($validated['type']),
            'status' => WorkingGroupStatus::from($validated['status']),
            'description' => $validated['description'] ?? null,
        ]);

        activity()
            ->performedOn($workingGroup)
            ->causedBy($request->user())
            ->log('updated working group');

        return Redirect::route('admin.working-groups.index')
            ->with('success', 'Working group updated successfully.');
    }

    /**
     * Remove the specified working group from storage.
     */
    public function workingGroupsDestroy(WorkingGroup $workingGroup): RedirectResponse
    {
        // Prevent deletion of public default group
        if ($workingGroup->is_public_default) {
            return Redirect::back()
                ->with('error', 'Cannot delete the public default working group.');
        }

        activity()
            ->performedOn($workingGroup)
            ->causedBy(auth()->user())
            ->log('deleted working group');

        $workingGroup->delete();

        return Redirect::route('admin.working-groups.index')
            ->with('success', 'Working group deleted successfully.');
    }

    /**
     * Display working group members.
     */
    public function workingGroupMembers(WorkingGroup $workingGroup): Response
    {
        $workingGroup->load(['memberships' => function ($query) {
            $query->with('user')->latest();
        }]);

        $availableUsers = User::whereNotIn('id', $workingGroup->memberships->pluck('user_id'))
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Admin/WorkingGroups/Members', [
            'workingGroup' => $workingGroup,
            'availableUsers' => $availableUsers,
            'roles' => collect(WorkingGroupRole::cases())->map(fn($role) => [
                'value' => $role->value,
                'label' => ucwords(str_replace('-', ' ', $role->value)),
            ]),
        ]);
    }

    /**
     * Add a member to working group.
     */
    public function workingGroupAddMember(Request $request, WorkingGroup $workingGroup): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'role' => ['required', Rule::in(array_column(WorkingGroupRole::cases(), 'value'))],
        ]);

        // Check if membership already exists
        if ($workingGroup->memberships()->where('user_id', $validated['user_id'])->exists()) {
            return Redirect::back()
                ->with('error', 'User is already a member of this working group.');
        }

        WorkingGroupMembership::create([
            'working_group_id' => $workingGroup->id,
            'user_id' => $validated['user_id'],
            'role' => WorkingGroupRole::from($validated['role']),
            'status' => MembershipStatus::ACTIVE,
            'joined_at' => now(),
        ]);

        return Redirect::back()
            ->with('success', 'Member added successfully.');
    }

    /**
     * Update a member's role in working group.
     */
    public function workingGroupUpdateMember(Request $request, WorkingGroup $workingGroup, WorkingGroupMembership $membership): RedirectResponse
    {
        $validated = $request->validate([
            'role' => ['required', Rule::in(array_column(WorkingGroupRole::cases(), 'value'))],
        ]);

        $membership->update([
            'role' => WorkingGroupRole::from($validated['role']),
        ]);

        return Redirect::back()
            ->with('success', 'Member role updated successfully.');
    }

    /**
     * Remove a member from working group.
     */
    public function workingGroupRemoveMember(WorkingGroup $workingGroup, WorkingGroupMembership $membership): RedirectResponse
    {
        $membership->delete();

        return Redirect::back()
            ->with('success', 'Member removed successfully.');
    }

    /**
     * Display users list.
     */
    public function usersIndex(): Response
    {
        $users = User::with(['memberships' => function ($query) {
            $query->with('workingGroup')->where('status', MembershipStatus::ACTIVE);
        }])
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
        ]);
    }

    /**
     * Display activity log.
     */
    public function activityLog(): Response
    {
        $activities = ActivityLog::with(['causer', 'subject'])
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/ActivityLog', [
            'activities' => $activities->through(function ($activity) {
                return [
                    'id' => $activity->id,
                    'log_name' => $activity->log_name,
                    'description' => $activity->description,
                    'subject_type' => $activity->subject_type ? class_basename($activity->subject_type) : null,
                    'subject_id' => $activity->subject_id,
                    'causer' => $activity->causer ? [
                        'id' => $activity->causer->id,
                        'name' => $activity->causer->name,
                    ] : null,
                    'properties' => $activity->properties,
                    'created_at' => $activity->created_at->format('Y-m-d H:i:s'),
                    'created_at_human' => $activity->created_at->diffForHumans(),
                ];
            }),
        ]);
    }
}
