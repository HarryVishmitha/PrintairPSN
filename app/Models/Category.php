<?php

namespace App\Models;

use App\Enums\CategoryStatus;
use App\Enums\CategoryVisibility;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Category extends Model
{
    use HasFactory, HasUuids, SoftDeletes, LogsActivity;

    protected $fillable = [
        'parent_id',
        'tree_path',
        'name',
        'slug',
        'description',
        'status',
        'visibility',
        'is_featured',
        'show_on_home',
        'sort_order',
        'meta_title',
        'meta_description',
        'locale',
        'published_at',
        'unpublished_at',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'status' => CategoryStatus::class,
        'visibility' => CategoryVisibility::class,
        'is_featured' => 'boolean',
        'show_on_home' => 'boolean',
        'sort_order' => 'integer',
        'published_at' => 'datetime',
        'unpublished_at' => 'datetime',
    ];

    protected $appends = [
        'breadcrumbs',
        'depth',
        'is_published',
    ];

    // Activity Log Configuration
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Category {$eventName}")
            ->useLogName('category');
    }

    /**
     * Relationships
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id')
            ->orderBy('sort_order')
            ->orderBy('name');
    }

    public function media(): HasMany
    {
        return $this->hasMany(CategoryMedia::class)->orderBy('sort_order');
    }

    public function primaryMedia(): HasMany
    {
        return $this->hasMany(CategoryMedia::class)
            ->where('type', 'primary')
            ->orderBy('sort_order');
    }

    public function galleryMedia(): HasMany
    {
        return $this->hasMany(CategoryMedia::class)
            ->where('type', 'gallery')
            ->orderBy('sort_order');
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'category_product')
            ->withPivot(['working_group_id', 'sort_order'])
            ->withTimestamps()
            ->orderByPivot('sort_order')
            ->orderBy('name');
    }

    public function workingGroups(): BelongsToMany
    {
        return $this->belongsToMany(WorkingGroup::class, 'category_working_group')
            ->withPivot(['visibility_override', 'label_override', 'sort_order_override'])
            ->withTimestamps();
    }

    public function slugs(): HasMany
    {
        return $this->hasMany(Slug::class, 'entity_id')
            ->where('entity_type', 'category');
    }

    public function canonicalSlug(): HasMany
    {
        return $this->hasMany(Slug::class, 'entity_id')
            ->where('entity_type', 'category')
            ->where('is_canonical', true);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Scopes
     */
    public function scopePublished($query)
    {
        return $query->where('status', CategoryStatus::PUBLISHED)
            ->where(function ($q) {
                $q->whereNull('published_at')
                    ->orWhere('published_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('unpublished_at')
                    ->orWhere('unpublished_at', '>', now());
            });
    }

    public function scopeDraft($query)
    {
        return $query->where('status', CategoryStatus::DRAFT);
    }

    public function scopeArchived($query)
    {
        return $query->where('status', CategoryStatus::ARCHIVED);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeShowOnHome($query)
    {
        return $query->where('show_on_home', true);
    }

    public function scopeGlobal($query)
    {
        return $query->where('visibility', CategoryVisibility::GLOBAL);
    }

    public function scopeRootOnly($query)
    {
        return $query->whereNull('parent_id');
    }

    public function scopeWithDepth($query, $maxDepth = null)
    {
        if ($maxDepth) {
            return $query->whereRaw('LENGTH(tree_path) - LENGTH(REPLACE(tree_path, "/", "")) <= ?', [$maxDepth]);
        }
        return $query;
    }

    public function scopeDescendantsOf($query, $categoryId)
    {
        $category = static::find($categoryId);
        if ($category && $category->tree_path) {
            return $query->where('tree_path', 'like', $category->tree_path . '/%');
        }
        return $query->whereRaw('1=0'); // Return empty result
    }

    public function scopeForWorkingGroup($query, $workingGroupId)
    {
        return $query->where(function ($q) use ($workingGroupId) {
            // Global categories
            $q->where('visibility', CategoryVisibility::GLOBAL)
                // Exclude those explicitly hidden for this group
                ->whereDoesntHave('workingGroups', function ($wq) use ($workingGroupId) {
                    $wq->where('working_group_id', $workingGroupId)
                        ->where('visibility_override', 'hidden');
                });
        })->orWhere(function ($q) use ($workingGroupId) {
            // Scoped categories explicitly visible to this group
            $q->where('visibility', CategoryVisibility::WORKING_GROUP_SCOPED)
                ->whereHas('workingGroups', function ($wq) use ($workingGroupId) {
                    $wq->where('working_group_id', $workingGroupId)
                        ->where('visibility_override', 'visible');
                });
        });
    }

    /**
     * Accessors & Mutators
     */
    public function getBreadcrumbsAttribute(): array
    {
        if (!$this->tree_path) {
            return [$this->name];
        }

        $ids = explode('/', $this->tree_path);
        $categories = static::whereIn('id', $ids)->orderByRaw('FIELD(id, ' . implode(',', array_map(fn($id) => "'$id'", $ids)) . ')')->get();
        
        return $categories->pluck('name')->toArray();
    }

    public function getDepthAttribute(): int
    {
        if (!$this->tree_path) {
            return 0;
        }
        return substr_count($this->tree_path, '/') + 1;
    }

    public function getIsPublishedAttribute(): bool
    {
        return $this->status === CategoryStatus::PUBLISHED
            && ($this->published_at === null || $this->published_at <= now())
            && ($this->unpublished_at === null || $this->unpublished_at > now());
    }

    /**
     * Helper Methods
     */
    public function isDescendantOf(Category $category): bool
    {
        if (!$this->tree_path || !$category->tree_path) {
            return false;
        }
        return str_starts_with($this->tree_path, $category->tree_path . '/');
    }

    public function isAncestorOf(Category $category): bool
    {
        return $category->isDescendantOf($this);
    }

    public function getDescendants()
    {
        return static::where('tree_path', 'like', $this->tree_path . '/%')->get();
    }

    public function getAncestors()
    {
        if (!$this->tree_path) {
            return collect();
        }

        $ids = explode('/', $this->tree_path);
        return static::whereIn('id', $ids)
            ->orderByRaw('FIELD(id, ' . implode(',', array_map(fn($id) => "'$id'", $ids)) . ')')
            ->get();
    }

    public function hasChildren(): bool
    {
        return $this->children()->exists();
    }

    public function canBeDeleted(): bool
    {
        return !$this->hasChildren() && !$this->products()->exists();
    }

    public function publish(): bool
    {
        $this->status = CategoryStatus::PUBLISHED;
        $this->published_at = $this->published_at ?? now();
        return $this->save();
    }

    public function unpublish(): bool
    {
        $this->status = CategoryStatus::DRAFT;
        $this->unpublished_at = now();
        return $this->save();
    }

    public function archive(): bool
    {
        $this->status = CategoryStatus::ARCHIVED;
        return $this->save();
    }
}
