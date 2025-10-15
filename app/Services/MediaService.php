<?php

namespace App\Services;

use App\Enums\MediaType;
use App\Jobs\GenerateImageVariants;
use App\Models\CategoryMedia;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaService
{
    protected string $disk = 'public';
    protected int $minWidth = 1200;
    protected int $minHeight = 600;
    protected array $allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    protected int $maxFileSize = 10 * 1024 * 1024; // 10MB

    /**
     * Upload and process category media
     */
    public function upload(
        string $categoryId,
        UploadedFile $file,
        string $altText,
        MediaType $type = MediaType::PRIMARY,
        ?array $focalPoint = null
    ): CategoryMedia {
        // Validate file
        $this->validateFile($file);

        DB::beginTransaction();

        try {
            // Generate unique filename
            $extension = $file->getClientOriginalExtension();
            $filename = 'original.' . $extension;
            $path = "categories/{$categoryId}/{$filename}";

            // Store original file
            $disk = Storage::disk($this->disk);
            $disk->putFileAs(
                "categories/{$categoryId}",
                $file,
                $filename
            );

            // Create media record
            $media = CategoryMedia::create([
                'category_id' => $categoryId,
                'type' => $type,
                'disk' => $this->disk,
                'path_original' => $path,
                'alt_text' => $altText,
                'focal_point' => $focalPoint ?? ['x' => 0.5, 'y' => 0.5],
                'sort_order' => $this->getNextSortOrder($categoryId, $type),
            ]);

            // Dispatch job to generate variants
            GenerateImageVariants::dispatch($media);

            activity()
                ->performedOn($media)
                ->withProperties([
                    'category_id' => $categoryId,
                    'type' => $type->value,
                    'filename' => $file->getClientOriginalName(),
                ])
                ->log('Category media uploaded');

            DB::commit();

            return $media;
        } catch (\Exception $e) {
            DB::rollBack();
            
            // Clean up file if it was uploaded
            if (isset($path) && Storage::disk($this->disk)->exists($path)) {
                Storage::disk($this->disk)->delete($path);
            }

            throw $e;
        }
    }

    /**
     * Update media metadata
     */
    public function update(CategoryMedia $media, array $data): CategoryMedia
    {
        $media->update($data);

        activity()
            ->performedOn($media)
            ->withProperties([
                'updated_fields' => array_keys($data),
            ])
            ->log('Category media updated');

        return $media->fresh();
    }

    /**
     * Update focal point
     */
    public function updateFocalPoint(CategoryMedia $media, float $x, float $y): CategoryMedia
    {
        $media->update([
            'focal_point' => ['x' => $x, 'y' => $y]
        ]);

        // Regenerate variants with new focal point
        GenerateImageVariants::dispatch($media);

        activity()
            ->performedOn($media)
            ->withProperties([
                'focal_point' => ['x' => $x, 'y' => $y],
            ])
            ->log('Category media focal point updated');

        return $media->fresh();
    }

    /**
     * Delete media
     */
    public function delete(CategoryMedia $media, bool $force = false): bool
    {
        activity()
            ->performedOn($media)
            ->withProperties([
                'category_id' => $media->category_id,
                'force' => $force,
            ])
            ->log('Category media deleted');

        if ($force) {
            return $media->forceDelete();
        }

        return $media->delete();
    }

    /**
     * Reorder media
     */
    public function reorder(string $categoryId, array $orderedIds): bool
    {
        DB::beginTransaction();

        try {
            foreach ($orderedIds as $index => $id) {
                CategoryMedia::where('id', $id)
                    ->where('category_id', $categoryId)
                    ->update(['sort_order' => $index]);
            }

            activity()
                ->withProperties([
                    'category_id' => $categoryId,
                    'media_count' => count($orderedIds),
                ])
                ->log('Category media reordered');

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Set primary media
     */
    public function setPrimary(CategoryMedia $media): CategoryMedia
    {
        DB::beginTransaction();

        try {
            // Set all other media to gallery
            CategoryMedia::where('category_id', $media->category_id)
                ->where('id', '!=', $media->id)
                ->where('type', MediaType::PRIMARY)
                ->update(['type' => MediaType::GALLERY]);

            // Set this one as primary
            $media->update(['type' => MediaType::PRIMARY]);

            activity()
                ->performedOn($media)
                ->log('Category media set as primary');

            DB::commit();

            return $media->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Validate uploaded file
     */
    protected function validateFile(UploadedFile $file): void
    {
        // Check file size
        if ($file->getSize() > $this->maxFileSize) {
            throw new \InvalidArgumentException('File size exceeds maximum allowed size of 10MB');
        }

        // Check MIME type
        if (!in_array($file->getMimeType(), $this->allowedMimes)) {
            throw new \InvalidArgumentException('Invalid file type. Allowed types: JPEG, PNG, WebP');
        }

        // Check dimensions
        $imageSize = getimagesize($file->getRealPath());
        if (!$imageSize) {
            throw new \InvalidArgumentException('Invalid image file');
        }

        [$width, $height] = $imageSize;

        if ($width < $this->minWidth || $height < $this->minHeight) {
            throw new \InvalidArgumentException(
                "Image dimensions must be at least {$this->minWidth}x{$this->minHeight}px"
            );
        }
    }

    /**
     * Get next sort order for media type
     */
    protected function getNextSortOrder(string $categoryId, MediaType $type): int
    {
        $maxOrder = CategoryMedia::where('category_id', $categoryId)
            ->where('type', $type)
            ->max('sort_order');

        return ($maxOrder ?? -1) + 1;
    }

    /**
     * Get media by category
     */
    public function getByCategory(string $categoryId, ?MediaType $type = null)
    {
        $query = CategoryMedia::where('category_id', $categoryId);

        if ($type) {
            $query->where('type', $type);
        }

        return $query->orderBy('sort_order')->get();
    }

    /**
     * Get primary media for category
     */
    public function getPrimary(string $categoryId): ?CategoryMedia
    {
        return CategoryMedia::where('category_id', $categoryId)
            ->where('type', MediaType::PRIMARY)
            ->orderBy('sort_order')
            ->first();
    }
}
