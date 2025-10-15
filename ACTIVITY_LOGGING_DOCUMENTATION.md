# Activity Logging System - Complete Documentation

## Overview

The activity logging system tracks all important actions and changes within the application using the Spatie Activity Log package. This provides a complete audit trail for compliance, debugging, and user activity monitoring.

## Features

- ✅ Automatic logging of model changes (Create, Update, Delete)
- ✅ Manual logging capabilities for custom actions
- ✅ User attribution (who did what)
- ✅ Subject tracking (what was affected)
- ✅ Property logging (detailed change information)
- ✅ Middleware for automatic HTTP request logging
- ✅ Comprehensive admin interface with filtering
- ✅ Automatic cleanup of old logs
- ✅ Working group context support

## Configuration

Configuration file: `config/activitylog.php`

```php
'enabled' => env('ACTIVITY_LOGGER_ENABLED', true),
'delete_records_older_than_days' => 365,
'default_log_name' => 'wg-audit',
'activity_model' => App\Models\ActivityLog::class,
```

## Models with Activity Logging

The following models automatically log their changes:

### 1. User Model
**Logged attributes:** `name`, `email`, `is_active`

**Events logged:**
- User created
- User updated
- User deleted

### 2. WorkingGroup Model
**Logged attributes:** `name`, `slug`, `type`, `status`, `settings`

**Events logged:**
- working_group_created
- working_group_updated
- working_group_deleted

### 3. WorkingGroupMembership Model
**Logged attributes:** `user_id`, `working_group_id`, `role`, `status`

**Events logged:**
- membership_created
- membership_updated
- membership_deleted

### 4. Order Model
**Logged attributes:** `status`, `total`, `currency`

**Events logged:**
- Order created
- Order updated
- Order deleted

### 5. Quote Model
**Logged attributes:** `status`, `total`, `currency`, `expires_at`

**Events logged:**
- Quote created
- Quote updated
- Quote deleted

### 6. Invoice Model
**Logged attributes:** `status`, `total`, `currency`, `issued_at`, `due_at`, `paid_at`

**Events logged:**
- Invoice created
- Invoice updated
- Invoice deleted

### 7. Asset Model
**Logged attributes:** `name`, `type`, `status`, `path`

**Events logged:**
- Asset created
- Asset updated
- Asset deleted

## Adding Activity Logging to New Models

To add activity logging to a new model:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class YourModel extends Model
{
    use LogsActivity;

    /**
     * Get the activity log options for this model
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['field1', 'field2', 'field3'])  // Fields to track
            ->logOnlyDirty()                            // Only log changed fields
            ->dontSubmitEmptyLogs()                     // Skip if nothing changed
            ->setDescriptionForEvent(fn(string $eventName) => "YourModel {$eventName}");
    }
}
```

## Manual Activity Logging

### Using the Helper Trait in Controllers

Add the trait to your controller:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\LogsActivity;
use App\Models\YourModel;

class YourController extends Controller
{
    use LogsActivity;

    public function store(Request $request)
    {
        $model = YourModel::create($request->validated());
        
        // Log the creation
        $this->logCreate($model);
        
        return redirect()->back();
    }

    public function update(Request $request, YourModel $model)
    {
        $model->update($request->validated());
        
        // Log the update with changes
        $this->logUpdate($model);
        
        return redirect()->back();
    }

    public function destroy(YourModel $model)
    {
        // Log before deletion
        $this->logDelete($model);
        
        $model->delete();
        
        return redirect()->back();
    }

    public function approve(YourModel $model)
    {
        $oldStatus = $model->status;
        $model->update(['status' => 'approved']);
        
        // Log status change
        $this->logStatusChange($model, $oldStatus, 'approved');
        
        return redirect()->back();
    }

    public function customAction(YourModel $model)
    {
        // Log custom action with properties
        $this->logAction(
            'Custom action performed',
            $model,
            ['additional_data' => 'value']
        );
        
        return redirect()->back();
    }
}
```

### Using the Activity Helper Directly

```php
// Basic log
activity()
    ->causedBy(auth()->user())
    ->log('User performed an action');

// Log with subject
activity()
    ->performedOn($model)
    ->causedBy(auth()->user())
    ->log('Model was viewed');

// Log with properties
activity()
    ->performedOn($model)
    ->causedBy(auth()->user())
    ->withProperties([
        'old_value' => $oldValue,
        'new_value' => $newValue,
    ])
    ->log('Value changed');

// Log with custom log name
activity('security-audit')
    ->causedBy(auth()->user())
    ->withProperties(['ip' => request()->ip()])
    ->log('Suspicious activity detected');
```

## Activity Log Middleware

The `LogActivityMiddleware` automatically logs certain HTTP requests.

**Automatically logged actions:**
- User login/logout
- Profile updates
- Admin user management (create, update, delete)
- Admin working group management
- All POST, PUT, PATCH, DELETE requests (with exclusions)

**Excluded paths:**
- Notification actions (mark as read, etc.)
- Internal debugging routes
- Livewire requests

To enable globally, add to `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->web(append: [
        \App\Http\Middleware\LogActivityMiddleware::class,
    ]);
})
```

## Viewing Activity Logs

### Admin Interface

Navigate to: `/admin/activity-log`

**Features:**
- Search by description or log name
- Filter by user (causer)
- Filter by subject type (User, Order, Invoice, etc.)
- Filter by log name
- Date range filtering
- Expandable details showing full property changes
- Pagination
- Responsive design with dark mode support

### Querying Activity Logs Programmatically

```php
use App\Models\ActivityLog;

// Get all activities
$activities = ActivityLog::all();

// Get activities for a specific user
$userActivities = ActivityLog::where('causer_id', $userId)->get();

// Get activities for a specific model
$modelActivities = ActivityLog::forSubject($model)->get();

// Get recent activities
$recent = ActivityLog::latest()->take(10)->get();

// Get activities with relationships
$activities = ActivityLog::with(['causer', 'subject'])->get();

// Get activities by log name
$auditLogs = ActivityLog::where('log_name', 'wg-audit')->get();

// Get activities within date range
$activities = ActivityLog::whereBetween('created_at', [$startDate, $endDate])->get();
```

## Cleaning Old Logs

### Artisan Command

```bash
# Clean logs older than configured days (default: 365)
php artisan activity-log:clean

# Clean logs older than specific days
php artisan activity-log:clean --days=90

# Force without confirmation
php artisan activity-log:clean --force

# Combine options
php artisan activity-log:clean --days=180 --force
```

### Schedule Automatic Cleanup

Add to `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    // Clean activity logs older than 365 days every month
    $schedule->command('activity-log:clean --force')
        ->monthly();
}
```

## Database Schema

**Table:** `activity_log`

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| log_name | string | Category/namespace for the log |
| description | text | Human-readable description |
| subject_type | string | Model class name (polymorphic) |
| subject_id | bigint | Model ID (polymorphic) |
| causer_type | string | User model class (polymorphic) |
| causer_id | bigint | User ID who caused the action |
| properties | json | Additional data and changes |
| event | string | Event name (created, updated, deleted) |
| batch_uuid | uuid | For grouping related actions |
| created_at | timestamp | When the action occurred |
| updated_at | timestamp | Last modified |

## Common Use Cases

### 1. Track Order Status Changes

```php
public function updateStatus(Order $order, string $newStatus)
{
    $oldStatus = $order->status;
    $order->update(['status' => $newStatus]);
    
    activity()
        ->performedOn($order)
        ->causedBy(auth()->user())
        ->withProperties([
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'order_total' => $order->total,
        ])
        ->log('Order status changed');
}
```

### 2. Track User Permission Changes

```php
public function updatePermissions(User $user, array $permissions)
{
    $oldPermissions = $user->permissions->pluck('name')->toArray();
    
    $user->syncPermissions($permissions);
    
    activity()
        ->performedOn($user)
        ->causedBy(auth()->user())
        ->withProperties([
            'old_permissions' => $oldPermissions,
            'new_permissions' => $permissions,
        ])
        ->log('User permissions updated');
}
```

### 3. Track File Downloads

```php
public function download(Asset $asset)
{
    activity()
        ->performedOn($asset)
        ->causedBy(auth()->user())
        ->withProperties([
            'file_name' => $asset->name,
            'file_path' => $asset->path,
            'ip_address' => request()->ip(),
        ])
        ->log('Asset downloaded');
    
    return response()->download($asset->path);
}
```

### 4. Track Bulk Operations

```php
public function bulkDelete(array $ids)
{
    $models = YourModel::whereIn('id', $ids)->get();
    
    $batchUuid = Str::uuid();
    
    foreach ($models as $model) {
        activity()
            ->performedOn($model)
            ->causedBy(auth()->user())
            ->withProperties(['batch_operation' => true])
            ->log('Bulk delete')
            ->batch($batchUuid);
        
        $model->delete();
    }
}
```

## Security Considerations

1. **Access Control**: Only admins and super admins can view activity logs
2. **Sensitive Data**: Don't log passwords or sensitive tokens
3. **Data Retention**: Configure appropriate retention periods
4. **Performance**: Use queues for high-volume logging if needed

## Performance Tips

1. **Index Optimization**: The migration includes indexes on `log_name`, `subject`, and `causer`
2. **Pagination**: Always paginate activity log results
3. **Eager Loading**: Use `with(['causer', 'subject'])` to avoid N+1 queries
4. **Cleanup**: Regularly clean old logs to maintain performance
5. **Selective Logging**: Use `logOnly()` to track specific fields only

## Troubleshooting

### Activities Not Being Logged

1. Check if activity logging is enabled: `ACTIVITY_LOGGER_ENABLED=true`
2. Verify the model uses the `LogsActivity` trait
3. Ensure `getActivitylogOptions()` is properly configured
4. Check database permissions

### Performance Issues

1. Add indexes to frequently queried columns
2. Clean old logs regularly
3. Consider partitioning the activity_log table
4. Use background jobs for non-critical logging

### Missing Activity Details

1. Verify `logOnly()` includes the fields you want to track
2. Check if `logOnlyDirty()` is preventing logs for unchanged data
3. Ensure relationships are loaded when needed

## API Integration

For API endpoints, you can track API usage:

```php
public function apiAction(Request $request)
{
    activity('api-access')
        ->causedBy($request->user())
        ->withProperties([
            'endpoint' => $request->path(),
            'method' => $request->method(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ])
        ->log('API request');
    
    // Your API logic here
}
```

## Conclusion

The activity logging system provides comprehensive audit trails for compliance, debugging, and monitoring user actions. It's flexible, performant, and easy to extend for new use cases.

For more information, see:
- [Spatie Activity Log Documentation](https://spatie.be/docs/laravel-activitylog)
- [Laravel Event Documentation](https://laravel.com/docs/events)
