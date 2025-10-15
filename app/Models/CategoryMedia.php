<?php

namespace App\Models;

use App\Enums\MediaType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class CategoryMedia extends Model
{
    use HasFactory, HasUuids, SoftDeletes, LogsActivity;

    protected $table = 'category_media';

    protected $fillable = [
        'category_id',
        'type',
        'disk',
        'path_original',
        'json_variants',
        'alt_text',
        'focal_point',
        'sort_order',
    ];

    protected $casts = [
        'type' => MediaType::class,
        'json_variants' => 'array',
        'focal_point' => 'array',
        'sort_order' => 'integer',
    ];

    protected $appends = [
        'url',
        'variants',
    ];

    // Activity Log Configuration
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Category media {$eventName}")
            ->useLogName('category_media');
    }

    /**
     * Relationships
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Accessors
     */
    public function getUrlAttribute(): ?string
    {
        if (!$this->path_original) {
            return null;
        }

        return Storage::disk($this->disk)->url($this->path_original);
    }

    public function getVariantsAttribute(): array
    {
        if (!$this->json_variants) {
            return [];
        }

        $variants = [];
        foreach ($this->json_variants as $key => $path) {
            $variants[$key] = [
                'path' => $path,
                'url' => Storage::disk($this->disk)->url($path),
            ];
        }

        return $variants;
    }

    /**
     * Helper Methods
     */
    public function getVariantUrl(string $variant): ?string
    {
        if (!isset($this->json_variants[$variant])) {
            return $this->url; // Fallback to original
        }

        return Storage::disk($this->disk)->url($this->json_variants[$variant]);
    }

    public function hasVariant(string $variant): bool
    {
        return isset($this->json_variants[$variant]);
    }

    public function getSrcSet(): string
    {
        $srcset = [];
        
        if ($this->hasVariant('sm')) {
            $srcset[] = $this->getVariantUrl('sm') . ' 400w';
        }
        
        if ($this->hasVariant('md')) {
            $srcset[] = $this->getVariantUrl('md') . ' 800w';
        }
        
        if ($this->hasVariant('lg')) {
            $srcset[] = $this->getVariantUrl('lg') . ' 1600w';
        }
        
        if (empty($srcset)) {
            $srcset[] = $this->url . ' 1600w';
        }

        return implode(', ', $srcset);
    }

    public function deleteFiles(): void
    {
        $disk = Storage::disk($this->disk);

        // Delete original
        if ($this->path_original && $disk->exists($this->path_original)) {
            $disk->delete($this->path_original);
        }

        // Delete all variants
        if ($this->json_variants) {
            foreach ($this->json_variants as $path) {
                if ($disk->exists($path)) {
                    $disk->delete($path);
                }
            }
        }
    }

    /**
     * Boot method to handle model events
     */
    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($media) {
            if (!$media->isForceDeleting()) {
                return; // Don't delete files on soft delete
            }
            $media->deleteFiles();
        });
    }
}
