<?php

namespace App\Models\Concerns;

use App\Models\WorkingGroup;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToWorkingGroup
{
    public function scopeForWorkingGroup(Builder $query, int|string $groupId): Builder
    {
        return $query->where('group_id', $groupId);
    }

    public function workingGroup(): BelongsTo
    {
        return $this->belongsTo(WorkingGroup::class, 'group_id');
    }
}
