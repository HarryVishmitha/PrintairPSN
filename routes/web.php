<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Designer\DesignerController;
use App\Http\Controllers\Manager\ManagerController;
use App\Http\Controllers\Marketing\MarketingController;
use App\Http\Controllers\Member\MemberController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WorkingGroupController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// If urls are special functions and controller with RBAC make sure it is under the correct group of url set.
// Example : admin's all fucntions should serve like this /admin/...

Route::get('/', function () {
    return Inertia::render('Home', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('home');

Route::get('/dashboard', function () {
    $user = auth()->user();
    
    // Redirect to appropriate dashboard based on user's role
    if ($user->hasRole('super_admin') || $user->hasRole('admin')) {
        return redirect()->route('admin.dashboard');
    } elseif ($user->hasRole('manager')) {
        return redirect()->route('manager.dashboard');
    } elseif ($user->hasRole('designer')) {
        return redirect()->route('designer.dashboard');
    } elseif ($user->hasRole('marketing')) {
        return redirect()->route('marketing.dashboard');
    } elseif ($user->hasRole('member')) {
        return redirect()->route('member.dashboard');
    }
    
    // Fallback to member dashboard if no specific role is found
    return redirect()->route('member.dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/shadcn-example', function () {
    return Inertia::render('ShadcnExample');
})->name('shadcn.example');

Route::get('/themed-welcome', function () {
    return Inertia::render('ThemedWelcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('themed.welcome');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Notification routes
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [\App\Http\Controllers\NotificationController::class, 'index'])->name('index');
        Route::get('/recent', [\App\Http\Controllers\NotificationController::class, 'recent'])->name('recent');
        Route::get('/unread-count', [\App\Http\Controllers\NotificationController::class, 'unreadCount'])->name('unread-count');
        Route::post('/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('mark-read');
        Route::post('/mark-all-read', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
        Route::delete('/{id}', [\App\Http\Controllers\NotificationController::class, 'destroy'])->name('destroy');
        Route::post('/test', [\App\Http\Controllers\NotificationController::class, 'createTest'])->name('test');
    });

    // Working Group routes
    Route::post('/working-groups/{workingGroup}/switch', [WorkingGroupController::class, 'switch'])
        ->name('working-groups.switch');
    Route::post('/working-groups/{workingGroup}/set-default', [WorkingGroupController::class, 'setDefault'])
        ->name('working-groups.set-default');

    // Admin routes (Super Admin & Admin only)
    Route::prefix('admin')->name('admin.')->middleware('role:super_admin,admin')->group(function () {
        Route::get('/', [AdminController::class, 'dashboard'])->name('dashboard');
        
        // Working Groups Management (Super Admin, Admin, Manager only)
        Route::prefix('working-groups')->name('working-groups.')->middleware('role:super_admin,admin,manager')->group(function () {
            Route::get('/', [AdminController::class, 'workingGroupsIndex'])->name('index');
            Route::get('/create', [AdminController::class, 'workingGroupsCreate'])->name('create');
            Route::post('/', [AdminController::class, 'workingGroupsStore'])->name('store');
            Route::get('/{workingGroup}/edit', [AdminController::class, 'workingGroupsEdit'])->name('edit');
            Route::patch('/{workingGroup}', [AdminController::class, 'workingGroupsUpdate'])->name('update');
            Route::delete('/{workingGroup}', [AdminController::class, 'workingGroupsDestroy'])->name('destroy');
            
            // Member management
            Route::get('/{workingGroup}/members', [AdminController::class, 'workingGroupMembers'])->name('members');
            Route::post('/{workingGroup}/members', [AdminController::class, 'workingGroupAddMember'])->name('members.add');
            Route::patch('/{workingGroup}/members/{membership}', [AdminController::class, 'workingGroupUpdateMember'])->name('members.update');
            Route::delete('/{workingGroup}/members/{membership}', [AdminController::class, 'workingGroupRemoveMember'])->name('members.remove');
        });
        
        // Users Management
        Route::get('/users', [AdminController::class, 'usersIndex'])->name('users.index');
        Route::get('/users/create', [AdminController::class, 'usersCreate'])->name('users.create');
        Route::post('/users', [AdminController::class, 'usersStore'])->name('users.store');
        Route::get('/users/{user}/edit', [AdminController::class, 'usersEdit'])->name('users.edit');
        Route::patch('/users/{user}', [AdminController::class, 'usersUpdate'])->name('users.update');
        Route::patch('/users/{user}/toggle-status', [AdminController::class, 'toggleUserStatus'])->name('users.toggle-status');
        Route::patch('/users/{user}/update-role', [AdminController::class, 'updateUserRole'])->name('users.update-role');
        Route::delete('/users/{user}', [AdminController::class, 'destroyUser'])->name('users.destroy');
        
        // Activity Log
        Route::get('/activity-log', [AdminController::class, 'activityLog'])->name('activity-log');
    });

    // Manager routes (Manager role only)
    Route::prefix('manager')->name('manager.')->middleware('role:manager')->group(function () {
        Route::get('/', [ManagerController::class, 'dashboard'])->name('dashboard');
    });

    // Designer routes (Designer role only)
    Route::prefix('designer')->name('designer.')->middleware('role:designer')->group(function () {
        Route::get('/', [DesignerController::class, 'dashboard'])->name('dashboard');
    });

    // Marketing routes (Marketing role only)
    Route::prefix('marketing')->name('marketing.')->middleware('role:marketing')->group(function () {
        Route::get('/', [MarketingController::class, 'dashboard'])->name('dashboard');
    });

    // Member routes (Member role - everyone has this)
    Route::prefix('member')->name('member.')->middleware('role:member')->group(function () {
        Route::get('/', [MemberController::class, 'dashboard'])->name('dashboard');
    });
});

require __DIR__.'/auth.php';
