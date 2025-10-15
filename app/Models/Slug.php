<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Slug extends Model
{
    use HasFactory, HasUuids, LogsActivity;

    protected $fillable = [
        'entity_type',
        'entity_id',
        'locale',
        'slug',
        'working_group_id',
        'is_canonical',
    ];

    protected $casts = [
        'is_canonical' => 'boolean',
    ];

    // Activity Log Configuration
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Slug {$eventName}")
            ->useLogName('slug');
    }

    /**
     * Relationships
     */
    public function entity()
    {
        return $this->morphTo('entity', 'entity_type', 'entity_id');
    }

    public function workingGroup(): BelongsTo
    {
        return $this->belongsTo(WorkingGroup::class);
    }

    /**
     * Scopes
     */
    public function scopeCanonical($query)
    {
        return $query->where('is_canonical', true);
    }

    public function scopeForEntity($query, string $type, string $id)
    {
        return $query->where('entity_type', $type)
            ->where('entity_id', $id);
    }

    public function scopeForLocale($query, ?string $locale = null)
    {
        return $query->where('locale', $locale);
    }

    public function scopeForWorkingGroup($query, ?string $workingGroupId = null)
    {
        return $query->where('working_group_id', $workingGroupId);
    }

    /**
     * Helper Methods
     */
    public static function findBySlug(string $slug, ?string $locale = null, ?string $workingGroupId = null)
    {
        return static::where('slug', $slug)
            ->where('locale', $locale)
            ->where('working_group_id', $workingGroupId)
            ->first();
    }

    public static function getCanonicalSlug(string $entityType, string $entityId, ?string $locale = null, ?string $workingGroupId = null)
    {
        return static::where('entity_type', $entityType)
            ->where('entity_id', $entityId)
            ->where('locale', $locale)
            ->where('working_group_id', $workingGroupId)
            ->where('is_canonical', true)
            ->first();
    }

    public static function createOrUpdateCanonical(string $entityType, string $entityId, string $slug, ?string $locale = null, ?string $workingGroupId = null)
    {
        // Mark all existing slugs as non-canonical
        static::where('entity_type', $entityType)
            ->where('entity_id', $entityId)
            ->where('locale', $locale)
            ->where('working_group_id', $workingGroupId)
            ->update(['is_canonical' => false]);

        // Create or update the canonical slug
        return static::updateOrCreate(
            [
                'entity_type' => $entityType,
                'entity_id' => $entityId,
                'slug' => $slug,
                'locale' => $locale,
                'working_group_id' => $workingGroupId,
            ],
            [
                'is_canonical' => true,
            ]
        );
    }

    public function makeCanonical(): bool
    {
        // Mark all other slugs for this entity as non-canonical
        static::where('entity_type', $this->entity_type)
            ->where('entity_id', $this->entity_id)
            ->where('locale', $this->locale)
            ->where('working_group_id', $this->working_group_id)
            ->where('id', '!=', $this->id)
            ->update(['is_canonical' => false]);

        $this->is_canonical = true;
        return $this->save();
    }

    public function getRedirectUrl(): ?string
    {
        if ($this->is_canonical) {
            return null; // No redirect needed for canonical slug
        }

        $canonical = static::getCanonicalSlug(
            $this->entity_type,
            $this->entity_id,
            $this->locale,
            $this->working_group_id
        );

        if (!$canonical) {
            return null;
        }

        // Build the URL based on entity type
        return match($this->entity_type) {
            'category' => "/c/{$canonical->slug}",
            'product' => "/p/{$canonical->slug}",
            default => null,
        };
    }
}
