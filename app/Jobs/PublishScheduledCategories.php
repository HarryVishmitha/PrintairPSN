<?php

namespace App\Jobs;

use App\Enums\CategoryStatus;
use App\Models\Category;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Publish/Unpublish categories based on scheduled dates
 * Should be scheduled to run every minute or every 5 minutes
 */
class PublishScheduledCategories implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $publishedCount = 0;
        $unpublishedCount = 0;

        // Find categories scheduled to be published
        $toPublish = Category::where('status', CategoryStatus::DRAFT)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->get();

        foreach ($toPublish as $category) {
            try {
                $category->publish();
                $publishedCount++;

                Log::info('Category auto-published', [
                    'category_id' => $category->id,
                    'name' => $category->name
                ]);

                activity()
                    ->performedOn($category)
                    ->withProperties([
                        'scheduled_at' => $category->published_at,
                        'published_at' => now()
                    ])
                    ->log('Category auto-published');
            } catch (\Exception $e) {
                Log::error('Failed to auto-publish category', [
                    'category_id' => $category->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // Find categories scheduled to be unpublished
        $toUnpublish = Category::where('status', CategoryStatus::PUBLISHED)
            ->whereNotNull('unpublished_at')
            ->where('unpublished_at', '<=', now())
            ->get();

        foreach ($toUnpublish as $category) {
            try {
                $category->unpublish();
                $unpublishedCount++;

                Log::info('Category auto-unpublished', [
                    'category_id' => $category->id,
                    'name' => $category->name
                ]);

                activity()
                    ->performedOn($category)
                    ->withProperties([
                        'scheduled_at' => $category->unpublished_at,
                        'unpublished_at' => now()
                    ])
                    ->log('Category auto-unpublished');
            } catch (\Exception $e) {
                Log::error('Failed to auto-unpublish category', [
                    'category_id' => $category->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        if ($publishedCount > 0 || $unpublishedCount > 0) {
            Log::info('Scheduled category status updates completed', [
                'published' => $publishedCount,
                'unpublished' => $unpublishedCount
            ]);
        }
    }
}
