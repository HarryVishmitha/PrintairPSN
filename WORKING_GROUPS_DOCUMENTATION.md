# Working Groups System Documentation

## Overview

The Working Groups system provides multi-tenancy capabilities for the PrintAir application. It allows users to organize their work into separate groups (teams/workspaces) with role-based access control, isolated data, and comprehensive activity tracking.

## Key Features

- ✅ Multi-tenant architecture with data isolation
- ✅ Role-based access control (RBAC) with 6 role levels
- ✅ Team-scoped permissions via Spatie Permission
- ✅ Comprehensive activity logging
- ✅ Feature flag support for gradual rollout
- ✅ Automatic slug generation and UUID support
- ✅ Soft deletes for data retention

## Architecture

### Core Models

#### WorkingGroup
Represents a workspace/team that groups users and resources together.

**Properties:**
- `id`: Primary key
- `uuid`: External identifier for API integrations
- `name`: Display name
- `slug`: URL-friendly identifier (auto-generated)
- `type`: PUBLIC or PRIVATE
- `status`: ACTIVE, INACTIVE, etc.
- `settings`: JSON configuration
- `is_public_default`: Boolean flag for the default public group

**Relationships:**
- `memberships()`: HasMany relationship to WorkingGroupMembership
- `members()`: HasManyThrough relationship to User

**Scopes:**
- `active()`: Filter active groups
- `type(WorkingGroupType $type)`: Filter by type

**Static Methods:**
- `publicDefault()`: Get the default public working group

#### WorkingGroupMembership
Represents a user's membership in a working group with a specific role.

**Properties:**
- `working_group_id`: Foreign key to working_groups
- `user_id`: Foreign key to users
- `role`: SUPER_ADMIN, ADMIN, MANAGER, DESIGNER, MARKETING, MEMBER
- `status`: INVITED, ACTIVE, LEFT, etc.
- `is_default`: Boolean flag for user's default group
- `joined_at`: Timestamp when user accepted invitation
- `left_at`: Timestamp when user left the group
- `invited_by`: Foreign key to the inviting user

**Relationships:**
- `workingGroup()`: BelongsTo WorkingGroup
- `user()`: BelongsTo User
- `inviter()`: BelongsTo User (who invited)

### Role Hierarchy

1. **SUPER_ADMIN** - Platform-level administrator (all access)
2. **ADMIN** - Working group administrator (manage group, members, all resources)
3. **MANAGER** - Resource manager (manage orders, quotes, invoices)
4. **DESIGNER** - Design resources access
5. **MARKETING** - Marketing resources access
6. **MEMBER** - Basic member (view and create own resources)

### Data Scoping

All major resources are scoped to working groups:

- Orders (`group_id`)
- Assets (`group_id`)
- Addresses (`group_id`)
- Quotes (`group_id`)
- Invoices (`group_id`)
- Payment Intents (`group_id`)
- Activity Logs (`group_id`)

Use the `BelongsToWorkingGroup` trait for easy implementation:

```php
use App\Models\Concerns\BelongsToWorkingGroup;

class YourModel extends Model
{
    use BelongsToWorkingGroup;
    
    // Now has:
    // - workingGroup() relationship
    // - scopeForWorkingGroup() query scope
}
```

## Middleware: SetCurrentWorkingGroup

Resolves and sets the current working group for each request.

### Resolution Priority

1. **Feature flag disabled** → Public default group
2. **Session storage** → User manually switched
3. **User's default group** → Marked as `is_default`
4. **First active membership** → Any active membership
5. **Public default group** → Fallback

### Usage

The middleware automatically:
- Sets `WorkingGroupContext`
- Stores group ID in session
- Adds `workingGroup` to request attributes
- Configures Spatie Permission team scoping

Access the current group:

```php
// Via service
$context = app(WorkingGroupContext::class);
$group = $context->current();

// Via request attribute
$group = $request->attributes->get('workingGroup');

// Via User relationship
$defaultGroup = $user->defaultWorkingGroup;
```

## Controllers

### WorkingGroupController

#### Switch Working Group
```php
POST /working-groups/{workingGroup}/switch
```

Switches the current user to a different working group.

**Requirements:**
- User must be authenticated
- User must have active membership in the group OR be SUPER_ADMIN
- Public default groups are accessible to all

**Response:**
- Success: Redirects back with success message
- Error: Redirects back with error message

#### Set Default Working Group
```php
POST /working-groups/{workingGroup}/set-default
```

Sets a working group as the user's default.

**Effects:**
- Removes `is_default` from all other memberships
- Sets `is_default = true` on target membership
- Updates `default_working_group_id` on user

## Activity Logging

All major events are logged automatically:

### Working Group Events
- `working_group_created`
- `working_group_updated`
- `working_group_deleted`
- `working_group_switched`
- `working_group_default_changed`

### Membership Events
- `working_group_membership_invited`
- `working_group_membership_accepted`
- `working_group_membership_role_changed`
- `working_group_membership_removed`

### Accessing Logs

```php
// Get all activities for a working group
$activities = Activity::where('group_id', $workingGroup->id)->get();

// Get activities for a specific event
$switches = Activity::where('description', 'working_group_switched')
    ->where('group_id', $workingGroup->id)
    ->get();

// Get user's activities
$userActivities = Activity::where('causer_id', $user->id)->get();
```

## Policies

### WorkingGroupPolicy

- `viewAny`: SUPER_ADMIN or any user with memberships
- `view`: Public groups: everyone; Private: members only
- `create`: SUPER_ADMIN only
- `update`: ADMIN of the group
- `delete`: SUPER_ADMIN (except public default)
- `manageMembers`: ADMIN of the group

### WorkingGroupMembershipPolicy

- `viewAny`: ADMIN or MANAGER
- `create`: ADMIN
- `update`: ADMIN
- `delete`: ADMIN (cannot delete other ADMINs)

### Resource Policies

All resource policies use the `HandlesWorkingGroupAuthorization` trait:

```php
// Check if user has required role in group
$this->userHasRole($user, $workingGroupId, [
    WorkingGroupRole::ADMIN,
    WorkingGroupRole::MANAGER,
]);
```

## Feature Flag

Control rollout with the `working-groups.enabled` feature flag:

```php
// In FeatureServiceProvider
Feature::define(SetCurrentWorkingGroup::FEATURE_KEY, fn () => false);

// Enable for all users
Feature::activate('working-groups.enabled');

// Enable for specific user
Feature::for($user)->activate('working-groups.enabled');

// Check status
if (Feature::active('working-groups.enabled')) {
    // Feature is enabled
}
```

## Database Seeding

The `DatabaseSeeder` automatically:

1. Creates a "Public" default working group
2. Assigns all users to it as MEMBER
3. Promotes first user to ADMIN + SUPER_ADMIN
4. Creates all necessary roles
5. Deactivates the feature flag by default

## Testing

Comprehensive test suites included:

### Policy Tests
- `WorkingGroupPolicyTest.php`
- `WorkingGroupMembershipPolicyTest.php`

### Model Tests
- `WorkingGroupTest.php`
- `WorkingGroupMembershipTest.php`

### Middleware Tests
- `WorkingGroupMiddlewareTest.php`

Run tests:
```bash
php artisan test --filter=WorkingGroup
```

## Best Practices

### 1. Always Scope Queries

```php
// Good
$orders = Order::forWorkingGroup($currentGroupId)->get();

// Also good
$orders = Order::where('group_id', $currentGroupId)->get();
```

### 2. Use WorkingGroupContext

```php
$context = app(WorkingGroupContext::class);
$currentGroup = $context->current();

// In policies or services
if ($context->currentId() === $resource->group_id) {
    // Resource belongs to current group
}
```

### 3. Check Permissions Before Actions

```php
$this->authorize('create', WorkingGroup::class);
$this->authorize('update', $workingGroup);
$this->authorize('manageMembers', $workingGroup);
```

### 4. Log Important Actions

```php
activity()
    ->performedOn($model)
    ->causedBy($user)
    ->withProperties(['key' => 'value'])
    ->log('custom_action');
```

### 5. Handle Feature Flag

```php
use App\Http\Middleware\SetCurrentWorkingGroup;
use Laravel\Pennant\Feature;

if (!Feature::active(SetCurrentWorkingGroup::FEATURE_KEY)) {
    // Feature disabled, use public group
    $group = WorkingGroup::publicDefault();
}
```

## API Integration

### External Identification

Use UUIDs for external API identification:

```php
// Find by UUID (for API endpoints)
$group = WorkingGroup::where('uuid', $request->uuid)->firstOrFail();

// Return in API responses
return [
    'id' => $group->uuid,  // Not the internal ID
    'name' => $group->name,
    'slug' => $group->slug,
];
```

### RESTful Endpoints (Recommended)

```
GET    /api/working-groups           - List user's groups
GET    /api/working-groups/{uuid}    - Get group details
POST   /api/working-groups           - Create group (SUPER_ADMIN)
PATCH  /api/working-groups/{uuid}    - Update group
DELETE /api/working-groups/{uuid}    - Delete group
POST   /api/working-groups/{uuid}/switch - Switch to group
GET    /api/working-groups/{uuid}/members - List members
POST   /api/working-groups/{uuid}/members - Invite member
PATCH  /api/working-groups/{uuid}/members/{user} - Update member role
DELETE /api/working-groups/{uuid}/members/{user} - Remove member
```

## Troubleshooting

### Issue: User can't access a working group

**Solution:**
1. Check if user has active membership: `$user->memberships()->where('working_group_id', $id)->where('status', 'active')->exists()`
2. Verify group status is ACTIVE
3. Check if feature flag is enabled
4. Verify user has appropriate role

### Issue: Permissions not working

**Solution:**
1. Ensure middleware is registered in `bootstrap/app.php`
2. Check `WorkingGroupContext` has current group set
3. Verify Spatie Permission team ID is set correctly
4. Clear permission cache: `php artisan permission:cache-reset`

### Issue: Activity logs not recording

**Solution:**
1. Verify `LogsActivity` trait is used on models
2. Check `getActivitylogOptions()` configuration
3. Ensure `group_id` column exists in activity_log table
4. Verify authenticated user exists when logging

## Security Considerations

1. **Data Isolation**: Always scope queries by `group_id`
2. **Role Validation**: Use policies, don't check roles directly in controllers
3. **SUPER_ADMIN Access**: Remember SUPER_ADMINs bypass group restrictions
4. **Public Groups**: Be cautious with `is_public_default` groups
5. **Soft Deletes**: Deleted groups/memberships are recoverable

## Migration Guide

### Adding Working Group Support to New Models

1. Add migration:
```php
Schema::table('your_table', function (Blueprint $table) {
    $table->foreignId('group_id')
        ->nullable()
        ->constrained('working_groups')
        ->nullOnDelete();
});
```

2. Update model:
```php
use App\Models\Concerns\BelongsToWorkingGroup;

class YourModel extends Model
{
    use BelongsToWorkingGroup;
    
    protected $fillable = ['group_id', ...];
}
```

3. Create policy:
```php
use App\Policies\Concerns\HandlesWorkingGroupAuthorization;

class YourModelPolicy
{
    use HandlesWorkingGroupAuthorization;
    
    public function view(User $user, YourModel $model): bool
    {
        return $this->userHasRole($user, $model->group_id, [
            WorkingGroupRole::ADMIN,
            WorkingGroupRole::MEMBER,
        ]);
    }
}
```

4. Register policy in `AuthServiceProvider`:
```php
protected $policies = [
    YourModel::class => YourModelPolicy::class,
];
```

## Support

For issues or questions:
1. Check this documentation
2. Review test files for examples
3. Examine existing implementations (Order, Asset, Address)
4. Contact the development team

---

**Version:** 1.0  
**Last Updated:** October 15, 2025  
**Status:** Production Ready ✅
