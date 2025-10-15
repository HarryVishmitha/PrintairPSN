<?php

namespace App\Models;

use App\Enums\MembershipStatus;
use App\Enums\WorkingGroupRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * Working Group Membership Model
 *
 * Represents a user's membership in a working group with a specific role.
 * Tracks invitation, acceptance, and role changes.
 *
 * @property int $id
 * @property int $working_group_id
 * @property int $user_id
 * @property WorkingGroupRole $role Role within the working group
 * @property MembershipStatus $status Current membership status
 * @property bool $is_default Whether this is the user's default working group
 * @property \DateTime|null $joined_at When the user accepted the invitation
 * @property \DateTime|null $left_at When the user left the working group
 * @property int|null $invited_by User ID who sent the invitation
 */
class WorkingGroupMembership extends Model
{
    use HasFactory;
    use LogsActivity;
    use SoftDeletes;

    protected $fillable = [
        'working_group_id',
        'user_id',
        'role',
        'status',
        'is_default',
        'joined_at',
        'invited_by',
        'left_at',
    ];

    protected $casts = [
        'role' => WorkingGroupRole::class,
        'status' => MembershipStatus::class,
        'is_default' => 'bool',
        'joined_at' => 'datetime',
        'left_at' => 'datetime',
    ];

    public function workingGroup(): BelongsTo
    {
        return $this->belongsTo(WorkingGroup::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    protected static function booted(): void
    {
        static::created(function (self $membership): void {
            $workingGroup = $membership->workingGroup;
            $user = $membership->user;

            activity()
                ->performedOn($membership)
                ->causedBy($membership->invited_by)
                ->withProperties([
                    'working_group_name' => $workingGroup?->name,
                    'user_name' => $user?->name,
                    'user_email' => $user?->email,
                    'role' => $membership->role->value,
                    'status' => $membership->status->value,
                ])
                ->log('working_group_membership_invited');
        });

        static::updating(function (self $membership): void {
            // Log when status changes to ACTIVE (user accepted invitation)
            if ($membership->isDirty('status') && $membership->status === MembershipStatus::ACTIVE) {
                $workingGroup = $membership->workingGroup;
                $user = $membership->user;

                activity()
                    ->performedOn($membership)
                    ->causedBy($user)
                    ->withProperties([
                        'working_group_name' => $workingGroup?->name,
                        'user_name' => $user?->name,
                        'role' => $membership->role->value,
                    ])
                    ->log('working_group_membership_accepted');
            }

            // Log role changes
            if ($membership->isDirty('role')) {
                $workingGroup = $membership->workingGroup;
                $user = $membership->user;

                activity()
                    ->performedOn($membership)
                    ->withProperties([
                        'working_group_name' => $workingGroup?->name,
                        'user_name' => $user?->name,
                        'old_role' => $membership->getOriginal('role'),
                        'new_role' => $membership->role->value,
                    ])
                    ->log('working_group_membership_role_changed');
            }
        });

        static::deleted(function (self $membership): void {
            $workingGroup = $membership->workingGroup;
            $user = $membership->user;

            activity()
                ->performedOn($membership)
                ->withProperties([
                    'working_group_name' => $workingGroup?->name,
                    'user_name' => $user?->name,
                    'role' => $membership->role->value,
                ])
                ->log('working_group_membership_removed');
        });
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['working_group_id', 'user_id', 'role', 'status', 'is_default'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('working_group_membership');
    }
}
