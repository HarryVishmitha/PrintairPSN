<?php

namespace App\Models;

use App\Models\Concerns\BelongsToWorkingGroup;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Address extends Model
{
    use BelongsToWorkingGroup;
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'group_id',
        'user_id',
        'type',
        'company',
        'name',
        'line1',
        'line2',
        'city',
        'state',
        'postal_code',
        'country',
        'phone',
        'is_default',
        'metadata',
    ];

    protected $casts = [
        'is_default' => 'bool',
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
