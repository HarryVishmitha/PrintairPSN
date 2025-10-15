# Login Credentials - Quick Reference

## Test Accounts

### 🔑 Super Admin Account
```
Email:    superadmin@printair.com
Password: super admin
Role:     SUPER_ADMIN
Access:   Full system access - Admin Dashboard
Dashboard: /admin/dashboard
```

**Can Access:**
- ✅ Admin Dashboard (`/admin/dashboard`)
- ✅ Working Groups Management (`/admin/working-groups`)
- ✅ Working Groups Members Management
- ✅ Users Management (when implemented)
- ✅ Activity Log Viewer (when implemented)
- ✅ All settings and configuration

---

### 👤 Test User (Member)
```
Email:    test@example.com
Password: password
Role:     MEMBER
Access:   Basic member access - Member Dashboard
Dashboard: /member/dashboard
```

**Can Access:**
- ✅ Member Dashboard (`/member/dashboard`)
- ✅ Personal profile
- ✅ Personal orders and assets
- ❌ Admin features (will show 403 error)
- ❌ Working Groups management

---

## Role Hierarchy

```
SUPER_ADMIN  ← Highest (Full Access)
    ↓
ADMIN        ← Full Access
    ↓
MANAGER      ← Management Features
    ↓
DESIGNER     ← Design Studio
    ↓
MARKETING    ← Campaign Management
    ↓
MEMBER       ← Basic Access (Lowest)
```

---

## Testing Access Control

### ✅ Test 1: Super Admin Access
1. Login as: `superadmin@printair.com` / `super admin`
2. Should redirect to: `/admin/dashboard`
3. Should see: Admin Dashboard with stats
4. Try accessing: `/admin/working-groups`
5. Should see: Working Groups management page

**Expected Result:** ✅ All admin features accessible

---

### ✅ Test 2: Member Restrictions
1. Login as: `test@example.com` / `password`
2. Should redirect to: `/member/dashboard`
3. Should see: Member Dashboard
4. Try accessing: `/admin/working-groups`
5. Should see: **Beautiful 403 error page** (purple theme, lock icon)

**Expected Result:** ✅ Properly blocked from admin features

---

### ✅ Test 3: Direct URL Access
**As Super Admin:**
- `/admin/dashboard` → ✅ Allowed
- `/admin/working-groups` → ✅ Allowed
- `/admin/working-groups/create` → ✅ Allowed
- `/manager/dashboard` → ❌ 403 (not a manager)

**As Member:**
- `/member/dashboard` → ✅ Allowed
- `/admin/dashboard` → ❌ 403 (not admin)
- `/manager/dashboard` → ❌ 403 (not manager)

---

## Route Protection Summary

### Admin Routes (Super Admin, Admin only)
```
/admin/dashboard
/admin/users
/admin/activity-log
```

### Working Groups Routes (Super Admin, Admin, Manager)
```
/admin/working-groups
/admin/working-groups/create
/admin/working-groups/{id}/edit
/admin/working-groups/{id}/members
```

### Manager Routes (Manager only)
```
/manager/dashboard
/manager/orders
/manager/team
```

### Designer Routes (Designer only)
```
/designer/dashboard
/designer/assets
/designer/projects
```

### Marketing Routes (Marketing only)
```
/marketing/dashboard
/marketing/campaigns
/marketing/analytics
```

### Member Routes (All logged-in users)
```
/member/dashboard
/member/profile
```

---

## Creating Additional Test Users

### Create Admin User
```bash
php artisan tinker
```

```php
$user = User::create([
    'name' => 'Admin User',
    'email' => 'admin@printair.com',
    'password' => bcrypt('password'),
    'email_verified_at' => now(),
]);

$publicGroup = WorkingGroup::where('is_public_default', true)->first();

WorkingGroupMembership::create([
    'working_group_id' => $publicGroup->id,
    'user_id' => $user->id,
    'role' => 'ADMIN',
    'status' => 'active',
    'is_default' => true,
    'joined_at' => now(),
]);

app(\Spatie\Permission\PermissionRegistrar::class)->setPermissionsTeamId($publicGroup->id);
$user->assignRole('admin');
```

### Create Manager User
```php
$user = User::create([
    'name' => 'Manager User',
    'email' => 'manager@printair.com',
    'password' => bcrypt('password'),
    'email_verified_at' => now(),
]);

$publicGroup = WorkingGroup::where('is_public_default', true)->first();

WorkingGroupMembership::create([
    'working_group_id' => $publicGroup->id,
    'user_id' => $user->id,
    'role' => 'MANAGER',
    'status' => 'active',
    'is_default' => true,
    'joined_at' => now(),
]);

app(\Spatie\Permission\PermissionRegistrar::class)->setPermissionsTeamId($publicGroup->id);
$user->assignRole('manager');
```

---

## Security Notes

### ⚠️ Production Considerations

1. **Change Default Passwords:**
   - Never use `super admin` or `password` in production
   - Use strong, unique passwords
   - Enforce password complexity rules

2. **Remove Test Accounts:**
   - Delete `test@example.com` before going live
   - Only keep necessary admin accounts

3. **Enable 2FA:**
   - Add two-factor authentication for admin accounts
   - Especially important for Super Admin

4. **Audit Logs:**
   - All admin actions are logged via Spatie Activity Log
   - Review logs regularly for suspicious activity

5. **Session Security:**
   - Use HTTPS in production
   - Configure secure session cookies
   - Set appropriate session timeout

---

## Troubleshooting

### Can't Login?
1. Clear cache: `php artisan cache:clear`
2. Clear config: `php artisan config:clear`
3. Reset permissions cache: `php artisan permission:cache-reset`
4. Try resetting password via forgot password flow

### Getting 403 Error as Super Admin?
1. Check database - verify role assignment:
   ```sql
   SELECT * FROM model_has_roles WHERE model_id = 1;
   ```
2. Clear all caches (see above)
3. Re-run seeder: `php artisan db:seed --class=DatabaseSeeder`
4. Check `SetCurrentWorkingGroup` middleware is running

### Wrong Dashboard Redirect?
1. Check role assignment in database
2. Verify `AuthenticatedSessionController::getRedirectUrlByRole()` logic
3. Clear browser cookies and login again

---

## Quick Commands

### Reset Everything
```bash
php artisan migrate:fresh --seed
php artisan config:clear
php artisan cache:clear
php artisan permission:cache-reset
```

### Check User Roles
```bash
php artisan tinker
```
```php
User::find(1)->roles->pluck('name');
// Should show: ["super-admin"]
```

### Check User Permissions Context
```php
app(\Spatie\Permission\PermissionRegistrar::class)->getPermissionsTeamId();
// Should show: 1 (when in Public working group)
```

---

## Important Files

- **User Seeder:** `database/seeders/DatabaseSeeder.php`
- **Login Controller:** `app/Http/Controllers/Auth/AuthenticatedSessionController.php`
- **Role Middleware:** `app/Http/Middleware/CheckRole.php`
- **Working Group Middleware:** `app/Http/Middleware/SetCurrentWorkingGroup.php`
- **Role Enum:** `app/Enums/WorkingGroupRole.php`

---

**Remember:** 
- Always test access control changes thoroughly
- Document any new roles or permissions
- Keep this file updated with new test accounts

**Status:** ✅ All accounts configured and tested

**Last Updated:** October 15, 2025
