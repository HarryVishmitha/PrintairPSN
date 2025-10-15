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

/**
 * Clean up orphaned media files and database records
 * Should be scheduled to run daily
 */
class CleanupOrphanedMedia implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 600; // 10 minutes

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $disk = Storage::disk('public');
        $cleanedFiles = 0;
        $cleanedRecords = 0;

        // Clean up soft-deleted media records older than 30 days
        $oldMediaRecords = CategoryMedia::onlyTrashed()
            ->where('deleted_at', '<', now()->subDays(30))
            ->get();

        foreach ($oldMediaRecords as $media) {
            try {
                // Delete files from storage
                $media->deleteFiles();
                
                // Force delete the record
                $media->forceDelete();
                $cleanedRecords++;
            } catch (\Exception $e) {
                Log::error('Failed to cleanup media record', [
                    'media_id' => $media->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // Find files in categories directory without database records
        if ($disk->exists('categories')) {
            $categoryDirs = $disk->directories('categories');

            foreach ($categoryDirs as $dir) {
                $categoryId = basename($dir);
                
                // Check if category exists
                $hasMedia = CategoryMedia::where('category_id', $categoryId)->exists();
                
                if (!$hasMedia) {
                    // No media records for this category, delete the entire directory
                    try {
                        $disk->deleteDirectory($dir);
                        $cleanedFiles++;
                        
                        Log::info('Deleted orphaned category media directory', [
                            'category_id' => $categoryId,
                            'path' => $dir
                        ]);
                    } catch (\Exception $e) {
                        Log::error('Failed to delete orphaned directory', [
                            'path' => $dir,
                            'error' => $e->getMessage()
                        ]);
                    }
                }
            }
        }

        // Find media records without files
        $mediaWithoutFiles = CategoryMedia::whereNotNull('path_original')->get();
        
        foreach ($mediaWithoutFiles as $media) {
            if (!$disk->exists($media->path_original)) {
                Log::warning('Media record missing file', [
                    'media_id' => $media->id,
                    'path' => $media->path_original
                ]);
                
                // Optionally delete the record or mark for manual review
                // $media->delete();
            }
        }

        Log::info('Orphaned media cleanup completed', [
            'cleaned_files' => $cleanedFiles,
            'cleaned_records' => $cleanedRecords
        ]);

        activity()
            ->withProperties([
                'cleaned_files' => $cleanedFiles,
                'cleaned_records' => $cleanedRecords
            ])
            ->log('Orphaned media cleanup completed');
    }
}
