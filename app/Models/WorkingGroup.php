<?php

namespace App\Models;

use App\Enums\WorkingGroupStatus;
use App\Enums\WorkingGroupType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * Working Group Model
 *
 * Represents a workspace/team that groups users and resources together.
 * All orders, assets, and other resources are scoped to a working group.
 *
 * @property int $id
 * @property string $uuid External identifier
 * @property string $name Display name of the working group
 * @property string $slug URL-friendly identifier
 * @property WorkingGroupType $type Type of working group (PUBLIC, PRIVATE, etc.)
 * @property WorkingGroupStatus $status Current status (ACTIVE, INACTIVE, etc.)
 * @property array|null $settings JSON configuration settings
 * @property int|null $billing_profile_id Associated billing profile
 * @property bool $is_public_default Whether this is the default public group
 */
class WorkingGroup extends Model
{
    use HasFactory;
    use LogsActivity;
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'type',
        'status',
        'settings',
        'billing_profile_id',
        'is_public_default',
    ];

    protected $casts = [
        'settings' => 'array',
        'type' => WorkingGroupType::class,
        'status' => WorkingGroupStatus::class,
        'is_public_default' => 'bool',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $group): void {
            $group->uuid ??= (string) Str::uuid();

            if (blank($group->slug)) {
                $base = Str::slug($group->name);
                $slug = $base;
                $suffix = 1;

                while (static::where('slug', $slug)->exists()) {
                    $slug = "{$base}-{$suffix}";
                    $suffix++;
                }

                $group->slug = $slug;
            }
        });

        static::created(function (self $group): void {
            activity()
                ->performedOn($group)
                ->withProperties([
                    'name' => $group->name,
                    'type' => $group->type->value,
                    'status' => $group->status->value,
                ])
                ->log('working_group_created');
        });

        static::updated(function (self $group): void {
            activity()
                ->performedOn($group)
                ->withProperties([
                    'name' => $group->name,
                    'changes' => $group->getChanges(),
                ])
                ->log('working_group_updated');
        });

        static::deleted(function (self $group): void {
            activity()
                ->performedOn($group)
                ->withProperties([
                    'name' => $group->name,
                ])
                ->log('working_group_deleted');
        });
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'slug', 'type', 'status', 'settings'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('working_group');
    }

    public function memberships(): HasMany
    {
        return $this->hasMany(WorkingGroupMembership::class);
    }

    public function members(): HasManyThrough
    {
        return $this->hasManyThrough(User::class, WorkingGroupMembership::class);
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'category_working_group')
            ->withPivot(['visibility_override', 'label_override', 'sort_order_override'])
            ->withTimestamps();
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', WorkingGroupStatus::ACTIVE);
    }

    public function scopeType(Builder $query, WorkingGroupType $type): Builder
    {
        return $query->where('type', $type);
    }

    public static function publicDefault(): ?self
    {
        return static::query()
            ->where('is_public_default', true)
            ->orderByDesc('id')
            ->first();
    }
}
