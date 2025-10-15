# Activity Logging System - Quick Test Guide

## Testing Checklist

### 1. Access the Activity Log Page

**URL:** `http://your-app.test/admin/activity-log`

**Requirements:**
- Must be logged in
- Must have `admin` or `super_admin` role

**Expected Result:**
- See a list of activity logs
- See filters at the top
- See pagination at the bottom

---

### 2. Test Automatic Model Logging

#### Test User Updates

```php
// In tinker or a controller
$user = User::first();
$user->update(['name' => 'Updated Name']);
```

**Expected Result:**
- New activity log entry created
- Description: "User updated"
- Properties show old and new values

#### Test Order Creation

```php
$order = Order::create([
    'uuid' => Str::uuid(),
    'group_id' => 1,
    'user_id' => 1,
    'status' => 'pending',
    'total' => 100.00,
    'currency' => 'USD',
]);
```

**Expected Result:**
- New activity log entry created
- Description: "Order created"
- Linked to the order (subject)

---

### 3. Test Manual Logging

#### Using Helper Trait

Add this to any controller:

```php
use App\Http\Controllers\Concerns\LogsActivity;

class TestController extends Controller
{
    use LogsActivity;

    public function test()
    {
        $user = User::first();
        
        $this->logEvent('Test event performed', [
            'test_data' => 'test value',
            'user_id' => $user->id,
        ]);
        
        return response()->json(['message' => 'Activity logged']);
    }
}
```

**Expected Result:**
- New activity log entry created
- Description: "Test event performed"
- Properties contain test data

---

### 4. Test Filtering

#### Search Filter

1. Enter a search term in the "Search" field
2. Click "Apply Filters"

**Expected Result:**
- Only activities matching the search term are shown

#### User Filter

1. Select a user from the "User" dropdown
2. Click "Apply Filters"

**Expected Result:**
- Only activities caused by that user are shown

#### Subject Type Filter

1. Select a subject type (e.g., "User", "Order")
2. Click "Apply Filters"

**Expected Result:**
- Only activities for that subject type are shown

#### Date Range Filter

1. Select "From Date" and "To Date"
2. Click "Apply Filters"

**Expected Result:**
- Only activities within that date range are shown

---

### 5. Test Expandable Details

1. Find an activity with properties
2. Click "Show Details" button

**Expected Result:**
- JSON properties expand below the activity
- Properties are formatted and readable
- Click "Hide Details" to collapse

---

### 6. Test Pagination

1. If there are more than 20 activities, pagination appears
2. Click "Next" or a page number

**Expected Result:**
- Page changes
- URL updates with page parameter
- New activities are loaded

---

### 7. Test Cleanup Command

```bash
# Test with dry run (view what would be deleted)
php artisan activity-log:clean --days=30

# Test with force (actually delete)
php artisan activity-log:clean --days=30 --force
```

**Expected Result:**
- Old activities are deleted
- Success message displayed
- Count of deleted records shown

---

### 8. Test Seeder

```bash
php artisan db:seed --class=ActivityLogSeeder
```

**Expected Result:**
- Sample activities created
- Various types of activities (user, order, working group)
- Different time periods

---

## Manual Testing Scenarios

### Scenario 1: User Login/Logout

1. Log out of the application
2. Log back in
3. Navigate to Activity Log

**Expected Result:**
- See "User logged in" activity
- Contains IP address and user agent

### Scenario 2: Profile Update

1. Go to Profile page
2. Update your name
3. Save changes
4. Navigate to Activity Log

**Expected Result:**
- See "User updated profile" activity
- Shows old and new values

### Scenario 3: Admin Actions

1. As admin, go to Users management
2. Create a new user
3. Navigate to Activity Log

**Expected Result:**
- See "admin_created_user" activity
- Contains user email and role information

### Scenario 4: Working Group Management

1. As admin, create a new working group
2. Navigate to Activity Log

**Expected Result:**
- See "working_group_created" activity
- Contains group name and type

---

## Troubleshooting

### No Activities Showing

**Check:**
1. Database has activity_log table
2. ACTIVITY_LOGGER_ENABLED=true in .env
3. User has admin/super_admin role
4. Filters are not too restrictive

### Activities Not Being Created

**Check:**
1. Model uses LogsActivity trait
2. getActivitylogOptions() is defined
3. Activity logging is enabled
4. Database connection is working

### Frontend Not Loading

**Check:**
1. npm run build completed successfully
2. ActivityLog.jsx is in resources/js/Pages/Admin/
3. Route exists: /admin/activity-log
4. User is authenticated and has admin role

---

## Performance Testing

### Test Large Dataset

```bash
# Create many activities
php artisan tinker

for ($i = 0; $i < 1000; $i++) {
    activity()->log("Test activity $i");
}
```

**Expected Result:**
- Page still loads quickly
- Pagination works correctly
- Filters work efficiently

### Test Database Indexes

```sql
-- Check indexes
SHOW INDEXES FROM activity_log;
```

**Expected Result:**
- Index on log_name
- Index on subject_type and subject_id
- Index on causer_type and causer_id
- Index on created_at (optional)

---

## Production Checklist

- [ ] Activity logging is enabled in production
- [ ] Cleanup command is scheduled (monthly/weekly)
- [ ] Database indexes are in place
- [ ] Access is restricted to admins only
- [ ] Sensitive data is not being logged
- [ ] Log retention period is configured
- [ ] Backup includes activity_log table
- [ ] Monitoring is set up for log growth

---

## Expected Behavior Summary

| Action | Expected Activity Log |
|--------|----------------------|
| User login | "User logged in" with IP |
| User logout | "User logged out" |
| Profile update | "User updated profile" with changes |
| User created | "User created" with attributes |
| Order created | "Order created" with details |
| Order status change | "Order updated" with status change |
| Working group created | "working_group_created" |
| Admin creates user | "admin_created_user" |
| Any model update | "ModelName updated" with changes |
| Any model deletion | "ModelName deleted" |

---

## Support

If you encounter any issues:

1. Check Laravel logs: `storage/logs/laravel.log`
2. Check browser console for JS errors
3. Verify database migrations are run
4. Check .env configuration
5. Review ACTIVITY_LOGGING_DOCUMENTATION.md

---

## Success Indicators

✅ Activity log page loads without errors
✅ Activities are listed with proper information
✅ Filters work correctly
✅ Pagination functions properly
✅ Expandable details show full properties
✅ New activities are created automatically
✅ Manual logging works as expected
✅ Cleanup command removes old records
✅ Performance is acceptable with large datasets
✅ Dark mode displays correctly

---

## Next Steps After Testing

1. Review logged data for sensitive information
2. Adjust retention period if needed
3. Schedule cleanup command
4. Train admins on using the activity log
5. Monitor database size
6. Consider archiving very old logs
7. Set up alerts for critical activities
8. Document custom logging patterns
