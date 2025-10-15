<?php

namespace App\Models;

use App\Models\Concerns\BelongsToWorkingGroup;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Invoice extends Model
{
    use BelongsToWorkingGroup;
    use HasFactory;
    use SoftDeletes;
    use LogsActivity;

    protected $fillable = [
        'uuid',
        'group_id',
        'order_id',
        'status',
        'total',
        'currency',
        'issued_at',
        'due_at',
        'paid_at',
        'metadata',
    ];

    protected $casts = [
        'total' => 'decimal:2',
        'issued_at' => 'datetime',
        'due_at' => 'datetime',
        'paid_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the activity log options for this model
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'total', 'currency', 'issued_at', 'due_at', 'paid_at'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Invoice {$eventName}");
    }
}
