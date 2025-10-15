<?php

namespace App\Observers;

use App\Models\Category;
use App\Models\Slug;
use Illuminate\Support\Str;

class CategoryObserver
{
    /**
     * Handle the Category "creating" event.
     */
    public function creating(Category $category): void
    {
        // Generate slug if not provided
        if (empty($category->slug)) {
            $category->slug = $this->generateUniqueSlug($category->name);
        }

        // Set created_by if authenticated
        if (auth()->check() && empty($category->created_by)) {
            $category->created_by = auth()->id();
        }

        // Build tree_path before save
        $this->buildTreePath($category);
    }

    /**
     * Handle the Category "created" event.
     */
    public function created(Category $category): void
    {
        // Create canonical slug entry
        $this->createCanonicalSlug($category);

        activity()
            ->performedOn($category)
            ->withProperties([
                'attributes' => $category->getAttributes(),
            ])
            ->log('Category created');
    }

    /**
     * Handle the Category "updating" event.
     */
    public function updating(Category $category): void
    {
        // Set updated_by if authenticated
        if (auth()->check()) {
            $category->updated_by = auth()->id();
        }

        // Handle slug change
        if ($category->isDirty('slug')) {
            $this->handleSlugChange($category);
        }

        // Handle parent change (moving category)
        if ($category->isDirty('parent_id')) {
            $this->handleParentChange($category);
        }
    }

    /**
     * Handle the Category "updated" event.
     */
    public function updated(Category $category): void
    {
        // If parent changed, update all descendants' tree paths
        if ($category->wasChanged('parent_id')) {
            $this->updateDescendantsTreePath($category);
        }

        activity()
            ->performedOn($category)
            ->withProperties([
                'old' => $category->getOriginal(),
                'attributes' => $category->getAttributes(),
            ])
            ->log('Category updated');
    }

    /**
     * Handle the Category "deleted" event.
     */
    public function deleted(Category $category): void
    {
        activity()
            ->performedOn($category)
            ->withProperties([
                'old' => $category->getOriginal(),
            ])
            ->log('Category deleted');
    }

    /**
     * Handle the Category "restored" event.
     */
    public function restored(Category $category): void
    {
        activity()
            ->performedOn($category)
            ->withProperties([
                'attributes' => $category->getAttributes(),
            ])
            ->log('Category restored');
    }

    /**
     * Generate a unique slug from the category name
     */
    protected function generateUniqueSlug(string $name, ?string $locale = null): string
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $counter = 1;

        while ($this->slugExists($slug, $locale)) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Check if a slug already exists
     */
    protected function slugExists(string $slug, ?string $locale = null): bool
    {
        return Category::where('slug', $slug)
            ->where('locale', $locale)
            ->exists();
    }

    /**
     * Build the tree_path for a category based on its parent
     */
    protected function buildTreePath(Category $category): void
    {
        if ($category->parent_id) {
            $parent = Category::find($category->parent_id);
            
            if ($parent) {
                // Prevent cyclic relationships
                if ($category->exists && $parent->isDescendantOf($category)) {
                    throw new \Exception('Cannot set a descendant as parent. This would create a cycle.');
                }

                // Build path: parent's path + current category id
                if ($parent->tree_path) {
                    $category->tree_path = $parent->tree_path . '/' . $parent->id;
                } else {
                    $category->tree_path = (string) $parent->id;
                }
            } else {
                $category->tree_path = null;
            }
        } else {
            // Root category
            $category->tree_path = null;
        }
    }

    /**
     * Create canonical slug entry in slugs table
     */
    protected function createCanonicalSlug(Category $category): void
    {
        Slug::createOrUpdateCanonical(
            entityType: 'category',
            entityId: $category->id,
            slug: $category->slug,
            locale: $category->locale,
            workingGroupId: null // Global by default
        );
    }

    /**
     * Handle slug change by creating non-canonical redirect
     */
    protected function handleSlugChange(Category $category): void
    {
        $oldSlug = $category->getOriginal('slug');
        $newSlug = $category->slug;

        // Don't allow slug change for published categories unless authorized
        // This logic can be enhanced with a policy check
        
        if ($oldSlug && $oldSlug !== $newSlug) {
            // Keep old slug as non-canonical (for 301 redirects)
            Slug::updateOrCreate(
                [
                    'entity_type' => 'category',
                    'entity_id' => $category->id,
                    'slug' => $oldSlug,
                    'locale' => $category->locale,
                    'working_group_id' => null,
                ],
                [
                    'is_canonical' => false,
                ]
            );
        }
    }

    /**
     * Handle parent change (category move)
     */
    protected function handleParentChange(Category $category): void
    {
        // Rebuild tree_path for the moved category
        $this->buildTreePath($category);
    }

    /**
     * Update tree paths for all descendants when a category moves
     */
    protected function updateDescendantsTreePath(Category $category): void
    {
        $descendants = Category::where('tree_path', 'like', $category->getOriginal('tree_path') . '/%')
            ->orWhere('tree_path', '=', $category->getOriginal('tree_path'))
            ->get();

        foreach ($descendants as $descendant) {
            $oldPath = $descendant->tree_path;
            $newPath = str_replace(
                $category->getOriginal('tree_path'),
                $category->tree_path,
                $oldPath
            );
            
            $descendant->withoutEvents(function () use ($descendant, $newPath) {
                $descendant->update(['tree_path' => $newPath]);
            });
        }
    }
}
