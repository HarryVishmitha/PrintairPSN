<?php

namespace App\Models;

use App\Models\Concerns\BelongsToWorkingGroup;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Quote extends Model
{
    use BelongsToWorkingGroup;
    use HasFactory;
    use SoftDeletes;
    use LogsActivity;

    protected $fillable = [
        'uuid',
        'group_id',
        'user_id',
        'status',
        'total',
        'currency',
        'expires_at',
        'metadata',
    ];

    protected $casts = [
        'total' => 'decimal:2',
        'expires_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the activity log options for this model
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'total', 'currency', 'expires_at'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Quote {$eventName}");
    }
}
