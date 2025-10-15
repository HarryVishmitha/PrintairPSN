<?php

namespace App\Http\Controllers\Admin;

use App\Enums\MembershipStatus;
use App\Enums\WorkingGroupRole;
use App\Enums\WorkingGroupStatus;
use App\Enums\WorkingGroupType;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Asset;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\Quote;
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
        // Calculate date ranges
        $today = now();
        $thirtyDaysAgo = now()->subDays(30);
        $sixtyDaysAgo = now()->subDays(60);

        // User stats
        $totalUsers = User::count();
        $activeUsers = User::where('is_active', true)->count();
        $newUsersThisMonth = User::where('created_at', '>=', $thirtyDaysAgo)->count();

        // Working Group stats
        $totalWorkingGroups = WorkingGroup::count();
        $activeWorkingGroups = WorkingGroup::where('status', WorkingGroupStatus::ACTIVE)->count();
        $activeMemberships = WorkingGroupMembership::where('status', MembershipStatus::ACTIVE)->count();

        // Orders stats
        $totalOrders = Order::count();
        $pendingOrders = Order::where('status', 'pending')->count();
        $completedOrders = Order::where('status', 'completed')->count();
        $ordersThisMonth = Order::where('created_at', '>=', $thirtyDaysAgo)->count();
        $ordersLastMonth = Order::whereBetween('created_at', [$sixtyDaysAgo, $thirtyDaysAgo])->count();
        $ordersGrowth = $ordersLastMonth > 0 
            ? round((($ordersThisMonth - $ordersLastMonth) / $ordersLastMonth) * 100, 1)
            : 0;

        // Quotes stats
        $totalQuotes = Quote::count();
        $pendingQuotes = Quote::where('status', 'pending')->count();
        $approvedQuotes = Quote::where('status', 'approved')->count();
        $quotesThisMonth = Quote::where('created_at', '>=', $thirtyDaysAgo)->count();

        // Assets stats
        $totalAssets = Asset::count();
        $assetsThisMonth = Asset::where('created_at', '>=', $thirtyDaysAgo)->count();

        // Invoices stats
        $totalInvoices = Invoice::count();
        $paidInvoices = Invoice::where('status', 'paid')->count();
        $pendingInvoices = Invoice::where('status', 'pending')->count();
        $overdueInvoices = Invoice::where('status', 'overdue')->count();
        $invoicesTotal = Invoice::sum('total');
        $invoicesPaid = Invoice::where('status', 'paid')->sum('total');
        $invoicesPending = Invoice::where('status', 'pending')->sum('total');

        // Activity logs
        $recentActivities = ActivityLog::count();

        $stats = [
            'users' => [
                'total' => $totalUsers,
                'active' => $activeUsers,
                'new_this_month' => $newUsersThisMonth,
            ],
            'workingGroups' => [
                'total' => $totalWorkingGroups,
                'active' => $activeWorkingGroups,
                'memberships' => $activeMemberships,
            ],
            'orders' => [
                'total' => $totalOrders,
                'pending' => $pendingOrders,
                'completed' => $completedOrders,
                'this_month' => $ordersThisMonth,
                'growth' => $ordersGrowth,
            ],
            'quotes' => [
                'total' => $totalQuotes,
                'pending' => $pendingQuotes,
                'approved' => $approvedQuotes,
                'this_month' => $quotesThisMonth,
            ],
            'assets' => [
                'total' => $totalAssets,
                'this_month' => $assetsThisMonth,
            ],
            'invoices' => [
                'total' => $totalInvoices,
                'paid' => $paidInvoices,
                'pending' => $pendingInvoices,
                'overdue' => $overdueInvoices,
                'total_amount' => $invoicesTotal,
                'paid_amount' => $invoicesPaid,
                'pending_amount' => $invoicesPending,
            ],
            'activities' => $recentActivities,
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

        // Recent orders
        $recentOrders = Order::with('user')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'user' => $order->user?->name ?? 'Unknown',
                    'status' => $order->status,
                    'total' => $order->total,
                    'created_at' => $order->created_at->format('M d, Y'),
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentActivity' => $recentActivity,
            'recentOrders' => $recentOrders,
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
    public function usersIndex(Request $request): Response
    {
        $query = User::with(['roles', 'memberships' => function ($query) {
            $query->with('workingGroup')->where('status', MembershipStatus::ACTIVE);
        }]);

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Role filter
        if ($request->filled('role')) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('name', $request->role);
            });
        }

        // Working Group filter
        if ($request->filled('working_group')) {
            $query->whereHas('memberships', function ($q) use ($request) {
                $q->where('working_group_id', $request->working_group)
                    ->where('status', MembershipStatus::ACTIVE);
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $users = $query->latest()->paginate(15)->withQueryString()->through(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_active' => $user->is_active,
                'primary_role' => $user->roles->first()?->name ?? 'member',
                'working_groups_count' => $user->memberships->count(),
                'created_at' => $user->created_at->format('M d, Y'),
            ];
        });

        // Get all roles for the filter dropdown
        $roles = \Spatie\Permission\Models\Role::select('id', 'name')->get()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
            ];
        });

        // Get all working groups for the filter dropdown
        $workingGroups = WorkingGroup::select('id', 'name')
            ->where('status', WorkingGroupStatus::ACTIVE)
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'workingGroups' => $workingGroups,
            'filters' => $request->only(['search', 'role', 'working_group', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function usersCreate(): Response
    {
        $roles = \Spatie\Permission\Models\Role::select('id', 'name')->get()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
            ];
        });

        $workingGroups = WorkingGroup::select('id', 'name')
            ->where('status', WorkingGroupStatus::ACTIVE)
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Users/Create', [
            'roles' => $roles,
            'workingGroups' => $workingGroups,
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function usersStore(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|string|exists:roles,name',
            'working_groups' => 'nullable|array',
            'working_groups.*' => 'exists:working_groups,id',
            'is_active' => 'boolean',
        ]);

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => bcrypt($request->password),
                'is_active' => $request->is_active ?? true,
                'email_verified_at' => now(),
            ]);

            // Assign role with working group context (use first working group or default)
            $workingGroupId = $request->working_groups[0] ?? WorkingGroup::first()?->id;
            if ($workingGroupId) {
                $user->assignRole($request->role, WorkingGroup::find($workingGroupId));
            }

            // Add user to selected working groups
            if ($request->working_groups) {
                foreach ($request->working_groups as $groupId) {
                    WorkingGroupMembership::create([
                        'user_id' => $user->id,
                        'working_group_id' => $groupId,
                        'role' => WorkingGroupRole::MEMBER,
                        'status' => MembershipStatus::ACTIVE,
                    ]);
                }
            }

            return redirect()->route('admin.users.index')->with('success', 'User created successfully.');
        } catch (\Exception $e) {
            return back()->withInput()->with('error', 'Failed to create user. ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing a user.
     */
    public function usersEdit(User $user): Response
    {
        $roles = \Spatie\Permission\Models\Role::select('id', 'name')->get()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
            ];
        });

        $workingGroups = WorkingGroup::select('id', 'name')
            ->where('status', WorkingGroupStatus::ACTIVE)
            ->orderBy('name')
            ->get();

        $userWorkingGroups = $user->memberships()
            ->where('status', MembershipStatus::ACTIVE)
            ->pluck('working_group_id')
            ->toArray();

        return Inertia::render('Admin/Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_active' => $user->is_active,
                'role' => $user->roles->first()?->name ?? 'member',
                'working_groups' => $userWorkingGroups,
            ],
            'roles' => $roles,
            'workingGroups' => $workingGroups,
        ]);
    }

    /**
     * Update a user.
     */
    public function usersUpdate(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8|confirmed',
            'role' => 'required|string|exists:roles,name',
            'working_groups' => 'nullable|array',
            'working_groups.*' => 'exists:working_groups,id',
            'is_active' => 'boolean',
        ]);

        try {
            $user->update([
                'name' => $request->name,
                'email' => $request->email,
                'is_active' => $request->is_active ?? $user->is_active,
            ]);

            // Update password if provided
            if ($request->filled('password')) {
                $user->update(['password' => bcrypt($request->password)]);
            }

            // Update role
            $workingGroupId = $request->working_groups[0] ?? WorkingGroup::first()?->id;
            if ($workingGroupId) {
                $user->syncRoles([$request->role], WorkingGroup::find($workingGroupId));
            }

            // Update working groups memberships
            if ($request->has('working_groups')) {
                // Remove old memberships
                $user->memberships()->delete();

                // Add new memberships
                foreach ($request->working_groups as $groupId) {
                    WorkingGroupMembership::create([
                        'user_id' => $user->id,
                        'working_group_id' => $groupId,
                        'role' => WorkingGroupRole::MEMBER,
                        'status' => MembershipStatus::ACTIVE,
                    ]);
                }
            }

            return redirect()->route('admin.users.index')->with('success', 'User updated successfully.');
        } catch (\Exception $e) {
            return back()->withInput()->with('error', 'Failed to update user. ' . $e->getMessage());
        }
    }

    /**
     * Toggle user active status.
     */
    public function toggleUserStatus(Request $request, User $user): RedirectResponse
    {
        try {
            $user->is_active = !$user->is_active;
            $user->save();

            return back()->with('success', $user->is_active 
                ? 'User activated successfully.' 
                : 'User deactivated successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update user status.');
        }
    }

    /**
     * Update user role.
     */
    public function updateUserRole(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'role' => 'required|string|exists:roles,name',
        ]);

        try {
            // Remove all current roles and assign the new one
            $user->syncRoles([$request->role]);

            return back()->with('success', 'User role updated successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update user role.');
        }
    }

    /**
     * Delete user.
     */
    public function destroyUser(User $user): RedirectResponse
    {
        try {
            // Prevent deletion of own account
            if ($user->id === auth()->id()) {
                return back()->with('error', 'You cannot delete your own account.');
            }

            // Delete related memberships first
            $user->memberships()->delete();

            // Delete the user
            $user->delete();

            return back()->with('success', 'User deleted successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete user.');
        }
    }

    /**
     * Display activity log.
     */
    public function activityLog(Request $request): Response
    {
        $query = ActivityLog::with(['causer', 'subject']);

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('log_name', 'like', "%{$search}%");
            });
        }

        // Causer (user) filter
        if ($request->filled('causer')) {
            $query->where('causer_id', $request->causer);
        }

        // Subject type filter
        if ($request->filled('subject_type')) {
            $subjectType = $request->subject_type;
            $query->where('subject_type', 'like', "%{$subjectType}%");
        }

        // Log name filter
        if ($request->filled('log_name')) {
            $query->where('log_name', $request->log_name);
        }

        // Date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $activities = $query->latest()->paginate(20)->withQueryString();

        // Get all users for filter dropdown
        $users = User::select('id', 'name')->orderBy('name')->get();

        // Get unique log names for filter
        $logNames = ActivityLog::select('log_name')
            ->distinct()
            ->whereNotNull('log_name')
            ->orderBy('log_name')
            ->pluck('log_name');

        // Get unique subject types for filter
        $subjectTypes = ActivityLog::select('subject_type')
            ->distinct()
            ->whereNotNull('subject_type')
            ->get()
            ->map(function ($activity) {
                return class_basename($activity->subject_type);
            })
            ->unique()
            ->sort()
            ->values();

        return Inertia::render('Admin/ActivityLog', [
            'activities' => $activities->through(function ($activity) {
                return [
                    'id' => $activity->id,
                    'log_name' => $activity->log_name,
                    'description' => $activity->description,
                    'subject_type' => $activity->subject_type ? class_basename($activity->subject_type) : null,
                    'subject_id' => $activity->subject_id,
                    'event' => $activity->event ?? null,
                    'causer' => $activity->causer ? [
                        'id' => $activity->causer->id,
                        'name' => $activity->causer->name,
                        'email' => $activity->causer->email,
                    ] : null,
                    'properties' => $activity->properties,
                    'created_at' => $activity->created_at->format('Y-m-d H:i:s'),
                    'created_at_human' => $activity->created_at->diffForHumans(),
                ];
            }),
            'users' => $users,
            'logNames' => $logNames,
            'subjectTypes' => $subjectTypes,
            'filters' => $request->only(['search', 'causer', 'subject_type', 'log_name', 'date_from', 'date_to']),
        ]);
    }
}
