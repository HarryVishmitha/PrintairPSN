<?php

namespace App\Models;

use App\Models\Concerns\BelongsToWorkingGroup;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Quote extends Model
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
}
