<?php

namespace App\Services;

use App\Models\Slug;
use Illuminate\Support\Str;

class SlugService
{
    /**
     * Resolve a slug to its entity
     */
    public function resolve(string $slug, string $entityType = 'category', ?string $locale = null, ?string $workingGroupId = null)
    {
        $slugRecord = Slug::where('slug', $slug)
            ->where('entity_type', $entityType)
            ->where('locale', $locale)
            ->where('working_group_id', $workingGroupId)
            ->first();

        if (!$slugRecord) {
            return null;
        }

        return [
            'entity' => $slugRecord->entity,
            'is_canonical' => $slugRecord->is_canonical,
            'redirect_url' => $slugRecord->getRedirectUrl(),
        ];
    }

    /**
     * Generate a unique slug
     */
    public function generate(string $text, string $entityType = 'category', ?string $locale = null, ?string $workingGroupId = null): string
    {
        $baseSlug = Str::slug($text);
        $slug = $baseSlug;
        $counter = 1;

        while ($this->exists($slug, $entityType, $locale, $workingGroupId)) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Check if a slug exists
     */
    public function exists(string $slug, string $entityType = 'category', ?string $locale = null, ?string $workingGroupId = null): bool
    {
        return Slug::where('slug', $slug)
            ->where('entity_type', $entityType)
            ->where('locale', $locale)
            ->where('working_group_id', $workingGroupId)
            ->exists();
    }

    /**
     * Create or update canonical slug
     */
    public function setCanonical(string $entityType, string $entityId, string $slug, ?string $locale = null, ?string $workingGroupId = null): Slug
    {
        return Slug::createOrUpdateCanonical($entityType, $entityId, $slug, $locale, $workingGroupId);
    }

    /**
     * Get canonical slug for an entity
     */
    public function getCanonical(string $entityType, string $entityId, ?string $locale = null, ?string $workingGroupId = null): ?Slug
    {
        return Slug::getCanonicalSlug($entityType, $entityId, $locale, $workingGroupId);
    }

    /**
     * Get all slugs for an entity (including historical)
     */
    public function getAllForEntity(string $entityType, string $entityId, ?string $locale = null, ?string $workingGroupId = null)
    {
        return Slug::where('entity_type', $entityType)
            ->where('entity_id', $entityId)
            ->where('locale', $locale)
            ->where('working_group_id', $workingGroupId)
            ->orderByDesc('is_canonical')
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Build SEO-friendly URL for an entity
     */
    public function buildUrl(string $entityType, string $slug, ?string $locale = null): string
    {
        $prefix = match($entityType) {
            'category' => '/c',
            'product' => '/p',
            default => '/' . $entityType,
        };

        $url = $prefix . '/' . $slug;

        if ($locale && $locale !== config('app.locale')) {
            $url = '/' . $locale . $url;
        }

        return $url;
    }

    /**
     * Validate slug format
     */
    public function validate(string $slug): bool
    {
        // Must be kebab-case, 3-140 chars, lowercase letters, numbers, hyphens only
        return preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug) 
            && strlen($slug) >= 3 
            && strlen($slug) <= 140;
    }

    /**
     * Get redirect map for all non-canonical slugs
     */
    public function getRedirectMap(string $entityType = 'category'): array
    {
        $slugs = Slug::where('entity_type', $entityType)
            ->where('is_canonical', false)
            ->with('entity')
            ->get();

        $redirects = [];

        foreach ($slugs as $slug) {
            $canonical = $this->getCanonical(
                $slug->entity_type,
                $slug->entity_id,
                $slug->locale,
                $slug->working_group_id
            );

            if ($canonical) {
                $redirects[$slug->slug] = $canonical->slug;
            }
        }

        return $redirects;
    }
}
