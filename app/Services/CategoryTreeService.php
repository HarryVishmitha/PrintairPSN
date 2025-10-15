<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class CategoryTreeService
{
    /**
     * Get the full category tree with caching
     */
    public function getTree(?string $workingGroupId = null, ?string $locale = null, bool $publishedOnly = false): Collection
    {
        $cacheKey = $this->getCacheKey('tree', $workingGroupId, $locale, $publishedOnly);

        return Cache::tags(['categories'])->remember($cacheKey, 3600, function () use ($workingGroupId, $locale, $publishedOnly) {
            $query = Category::with(['children', 'primaryMedia'])
                ->whereNull('parent_id');

            if ($publishedOnly) {
                $query->published();
            }

            if ($workingGroupId) {
                $query->forWorkingGroup($workingGroupId);
            }

            if ($locale) {
                $query->where('locale', $locale);
            }

            return $query->orderBy('sort_order')
                ->orderBy('name')
                ->get()
                ->map(fn($category) => $this->buildNode($category, $workingGroupId, $publishedOnly));
        });
    }

    /**
     * Build a tree node recursively
     */
    protected function buildNode(Category $category, ?string $workingGroupId, bool $publishedOnly): array
    {
        $node = [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'status' => $category->status->value,
            'is_featured' => $category->is_featured,
            'show_on_home' => $category->show_on_home,
            'sort_order' => $category->sort_order,
            'depth' => $category->depth,
            'media' => $category->primaryMedia->first()?->only(['id', 'alt_text', 'variants']),
            'children' => [],
        ];

        // Load children recursively
        $childrenQuery = $category->children();
        
        if ($publishedOnly) {
            $childrenQuery->published();
        }

        if ($workingGroupId) {
            $childrenQuery->forWorkingGroup($workingGroupId);
        }

        $children = $childrenQuery->get();

        foreach ($children as $child) {
            $node['children'][] = $this->buildNode($child, $workingGroupId, $publishedOnly);
        }

        return $node;
    }

    /**
     * Get breadcrumb trail for a category
     */
    public function getBreadcrumbs(Category $category): array
    {
        $ancestors = $category->getAncestors();
        
        $breadcrumbs = $ancestors->map(function ($ancestor) {
            return [
                'id' => $ancestor->id,
                'name' => $ancestor->name,
                'slug' => $ancestor->slug,
            ];
        })->toArray();

        $breadcrumbs[] = [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
        ];

        return $breadcrumbs;
    }

    /**
     * Move a category to a new parent
     */
    public function move(Category $category, ?string $newParentId): bool
    {
        DB::beginTransaction();

        try {
            // Validate move
            if ($newParentId) {
                $newParent = Category::findOrFail($newParentId);
                
                // Prevent cyclic relationships
                if ($newParent->isDescendantOf($category)) {
                    throw new \Exception('Cannot move category to its own descendant');
                }
            }

            $category->parent_id = $newParentId;
            $category->save();

            $this->clearCache();

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Reorder categories within the same parent
     */
    public function reorder(array $orderedIds, ?string $parentId = null): bool
    {
        DB::beginTransaction();

        try {
            foreach ($orderedIds as $index => $id) {
                Category::where('id', $id)
                    ->where('parent_id', $parentId)
                    ->update(['sort_order' => $index]);
            }

            $this->clearCache();

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get all descendants of a category
     */
    public function getDescendants(Category $category, bool $publishedOnly = false): Collection
    {
        $query = Category::where('tree_path', 'like', $category->tree_path . '/%');

        if ($publishedOnly) {
            $query->published();
        }

        return $query->orderBy('tree_path')->get();
    }

    /**
     * Check if a category has children
     */
    public function hasChildren(Category $category): bool
    {
        return $category->children()->exists();
    }

    /**
     * Get category depth statistics
     */
    public function getDepthStats(): array
    {
        return DB::table('categories')
            ->select(DB::raw('
                MAX(LENGTH(tree_path) - LENGTH(REPLACE(tree_path, "/", ""))) as max_depth,
                AVG(LENGTH(tree_path) - LENGTH(REPLACE(tree_path, "/", ""))) as avg_depth
            '))
            ->first();
    }

    /**
     * Find orphaned categories (parent_id points to non-existent category)
     */
    public function findOrphaned(): Collection
    {
        return Category::whereNotNull('parent_id')
            ->whereDoesntHave('parent')
            ->get();
    }

    /**
     * Clear all category caches
     */
    public function clearCache(?string $workingGroupId = null): void
    {
        if ($workingGroupId) {
            Cache::tags(['categories', "category_group_{$workingGroupId}"])->flush();
        } else {
            Cache::tags(['categories'])->flush();
        }
    }

    /**
     * Generate cache key
     */
    protected function getCacheKey(string $type, ?string $workingGroupId, ?string $locale, bool $publishedOnly): string
    {
        return sprintf(
            'category:%s:%s:%s:%s',
            $type,
            $workingGroupId ?? 'global',
            $locale ?? 'default',
            $publishedOnly ? 'published' : 'all'
        );
    }
}
