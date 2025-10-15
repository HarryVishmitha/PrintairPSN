<?php

namespace App\Models;

use App\Enums\WorkingGroupRole;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens;
    use HasFactory;
    use HasRoles;
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'default_working_group_id' => 'integer',
        ];
    }

    public function memberships(): HasMany
    {
        return $this->hasMany(WorkingGroupMembership::class);
    }

    public function workingGroups(): BelongsToMany
    {
        return $this->belongsToMany(WorkingGroup::class, 'working_group_memberships')
            ->withPivot(['role', 'status', 'is_default'])
            ->withTimestamps();
    }

    public function defaultMembership(): HasOne
    {
        return $this->hasOne(WorkingGroupMembership::class)->where('is_default', true);
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole(WorkingGroupRole::SUPER_ADMIN->value);
    }
}
