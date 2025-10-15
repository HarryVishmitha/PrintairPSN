<?php

namespace App\Models;

use App\Models\Concerns\BelongsToWorkingGroup;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use BelongsToWorkingGroup;
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'group_id',
        'user_id',
        'status',
        'total',
        'currency',
        'metadata',
        'submitted_at',
        'approved_at',
        'cancelled_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'total' => 'decimal:2',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
