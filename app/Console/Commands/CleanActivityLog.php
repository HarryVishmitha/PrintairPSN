<?php

namespace App\Console\Commands;

use App\Models\ActivityLog;
use Illuminate\Console\Command;

class CleanActivityLog extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'activity-log:clean 
                            {--days= : Number of days to keep (default from config)}
                            {--force : Force deletion without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean old activity log records';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $days = $this->option('days') ?? config('activitylog.delete_records_older_than_days', 365);
        $force = $this->option('force');

        $cutoffDate = now()->subDays($days);

        $count = ActivityLog::where('created_at', '<', $cutoffDate)->count();

        if ($count === 0) {
            $this->info('No activity logs to clean.');
            return self::SUCCESS;
        }

        $this->info("Found {$count} activity log(s) older than {$days} days.");

        if (!$force && !$this->confirm('Do you want to delete these records?', true)) {
            $this->info('Operation cancelled.');
            return self::SUCCESS;
        }

        $this->info('Deleting old activity logs...');

        $deleted = ActivityLog::where('created_at', '<', $cutoffDate)->delete();

        $this->info("Successfully deleted {$deleted} activity log record(s).");

        return self::SUCCESS;
    }
}
