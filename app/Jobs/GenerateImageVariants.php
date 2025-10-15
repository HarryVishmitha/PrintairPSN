<?php

namespace App\Jobs;

use App\Models\CategoryMedia;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

/**
 * Generate responsive image variants for category media
 * 
 * Prerequisites:
 * Run: composer require intervention/image-laravel
 */
class GenerateImageVariants implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300; // 5 minutes
    public $tries = 3;

    protected CategoryMedia $media;

    /**
     * Create a new job instance.
     */
    public function __construct(CategoryMedia $media)
    {
        $this->media = $media;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $disk = Storage::disk($this->media->disk);
            
            if (!$disk->exists($this->media->path_original)) {
                Log::error('Original image not found', [
                    'media_id' => $this->media->id,
                    'path' => $this->media->path_original
                ]);
                return;
            }

            // Get original image
            $originalPath = $disk->path($this->media->path_original);
            
            // Validate image
            try {
                $image = Image::read($originalPath);
            } catch (\Exception $e) {
                Log::error('Invalid image file', [
                    'media_id' => $this->media->id,
                    'error' => $e->getMessage()
                ]);
                return;
            }

            // Auto-orient based on EXIF
            $image->orientate();

            // Get category ID for path
            $categoryId = $this->media->category_id;
            $baseDir = "categories/{$categoryId}";
            
            // Focal point for smart cropping
            $focalX = $this->media->focal_point['x'] ?? 0.5;
            $focalY = $this->media->focal_point['y'] ?? 0.5;

            $variants = [];

            // Define variants with dimensions
            $sizes = [
                'thumb' => [150, 150],
                'sm' => [400, 400],
                'md' => [800, 800],
                'lg' => [1600, 1600],
            ];

            foreach ($sizes as $size => [$width, $height]) {
                // Generate WebP variant
                $webpPath = "{$baseDir}/{$size}.webp";
                $this->generateVariant($image, $disk, $webpPath, $width, $height, 'webp', $focalX, $focalY);
                $variants[$size . '_webp'] = $webpPath;

                // Generate AVIF variant (better compression, modern browsers)
                $avifPath = "{$baseDir}/{$size}.avif";
                $this->generateVariant($image, $disk, $avifPath, $width, $height, 'avif', $focalX, $focalY);
                $variants[$size . '_avif'] = $avifPath;

                // Generate standard JPG/PNG as fallback
                $ext = pathinfo($this->media->path_original, PATHINFO_EXTENSION);
                $standardPath = "{$baseDir}/{$size}.{$ext}";
                $this->generateVariant($image, $disk, $standardPath, $width, $height, $ext, $focalX, $focalY);
                $variants[$size] = $standardPath;
            }

            // Update media record with variants
            $this->media->update([
                'json_variants' => $variants
            ]);

            Log::info('Image variants generated successfully', [
                'media_id' => $this->media->id,
                'variants' => count($variants)
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to generate image variants', [
                'media_id' => $this->media->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            throw $e;
        }
    }

    /**
     * Generate a single variant
     */
    protected function generateVariant(
        $image,
        $disk,
        string $path,
        int $width,
        int $height,
        string $format,
        float $focalX,
        float $focalY
    ): void {
        // Clone image for this variant
        $variant = clone $image;

        // Resize with smart cropping focused on focal point
        $variant->cover($width, $height, 'center');

        // Optimize quality
        $quality = match($format) {
            'webp' => 85,
            'avif' => 75,
            'jpg', 'jpeg' => 85,
            'png' => 90,
            default => 85,
        };

        // Encode with format-specific options
        $encoded = match($format) {
            'webp' => $variant->toWebp($quality),
            'avif' => $variant->toAvif($quality),
            'jpg', 'jpeg' => $variant->toJpeg($quality),
            'png' => $variant->toPng(),
            default => $variant->toJpeg($quality),
        };

        // Save to disk
        $disk->put($path, (string) $encoded);
    }

    /**
     * Handle job failure
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('GenerateImageVariants job failed', [
            'media_id' => $this->media->id,
            'error' => $exception->getMessage()
        ]);

        activity()
            ->performedOn($this->media)
            ->withProperties([
                'error' => $exception->getMessage(),
            ])
            ->log('Image variant generation failed');
    }
}
