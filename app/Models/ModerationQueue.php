<?php

namespace App\Models;

use App\Enums\ModerationStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class ModerationQueue extends Model
{
    use HasFactory, HasUuids, LogsActivity;

    protected $table = 'moderation_queue';

    protected $fillable = [
        'entity_type',
        'entity_id',
        'action',
        'status',
        'requested_by',
        'reviewed_by',
        'notes',
        'payload_snapshot',
        'reviewed_at',
    ];

    protected $casts = [
        'status' => ModerationStatus::class,
        'payload_snapshot' => 'array',
        'reviewed_at' => 'datetime',
    ];

    // Activity Log Configuration
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Moderation queue {$eventName}")
            ->useLogName('moderation');
    }

    /**
     * Relationships
     */
    public function entity()
    {
        return $this->morphTo('entity', 'entity_type', 'entity_id');
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Scopes
     */
    public function scopePending($query)
    {
        return $query->where('status', ModerationStatus::PENDING);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', ModerationStatus::APPROVED);
    }

    public function scopeRejected($query)
    {
        return $query->where('status', ModerationStatus::REJECTED);
    }

    public function scopeForEntity($query, string $type, string $id)
    {
        return $query->where('entity_type', $type)
            ->where('entity_id', $id);
    }

    public function scopeForUser($query, string $userId)
    {
        return $query->where('requested_by', $userId);
    }

    /**
     * Helper Methods
     */
    public function approve(User $reviewer, ?string $notes = null): bool
    {
        $this->status = ModerationStatus::APPROVED;
        $this->reviewed_by = $reviewer->id;
        $this->reviewed_at = now();
        
        if ($notes) {
            $this->notes = $notes;
        }

        return $this->save();
    }

    public function reject(User $reviewer, string $notes): bool
    {
        $this->status = ModerationStatus::REJECTED;
        $this->reviewed_by = $reviewer->id;
        $this->reviewed_at = now();
        $this->notes = $notes;

        return $this->save();
    }

    public function isPending(): bool
    {
        return $this->status === ModerationStatus::PENDING;
    }

    public function isApproved(): bool
    {
        return $this->status === ModerationStatus::APPROVED;
    }

    public function isRejected(): bool
    {
        return $this->status === ModerationStatus::REJECTED;
    }

    public function getEntityName(): string
    {
        return match($this->entity_type) {
            'category' => 'Category',
            'product' => 'Product',
            default => ucfirst($this->entity_type),
        };
    }
}
