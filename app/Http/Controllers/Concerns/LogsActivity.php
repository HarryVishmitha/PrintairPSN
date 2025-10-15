<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Database\Eloquent\Model;

trait LogsActivity
{
    /**
     * Log an activity
     */
    protected function logActivity(
        string $description,
        ?Model $subject = null,
        array $properties = [],
        ?string $logName = null
    ): void {
        $activity = activity($logName ?? config('activitylog.default_log_name'))
            ->causedBy(auth()->user());

        if ($subject) {
            $activity->performedOn($subject);
        }

        if (!empty($properties)) {
            $activity->withProperties($properties);
        }

        $activity->log($description);
    }

    /**
     * Log a create action
     */
    protected function logCreate(Model $model, array $additionalProperties = []): void
    {
        $this->logActivity(
            class_basename($model) . ' created',
            $model,
            array_merge([
                'attributes' => $model->getAttributes(),
            ], $additionalProperties)
        );
    }

    /**
     * Log an update action
     */
    protected function logUpdate(Model $model, array $changes = []): void
    {
        $this->logActivity(
            class_basename($model) . ' updated',
            $model,
            [
                'old' => $model->getOriginal(),
                'new' => $model->getAttributes(),
                'changes' => $changes ?: $model->getChanges(),
            ]
        );
    }

    /**
     * Log a delete action
     */
    protected function logDelete(Model $model): void
    {
        $this->logActivity(
            class_basename($model) . ' deleted',
            $model,
            [
                'attributes' => $model->getAttributes(),
            ]
        );
    }

    /**
     * Log a status change
     */
    protected function logStatusChange(Model $model, string $oldStatus, string $newStatus): void
    {
        $this->logActivity(
            class_basename($model) . ' status changed',
            $model,
            [
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
            ]
        );
    }

    /**
     * Log a custom action with subject
     */
    protected function logAction(string $action, Model $subject, array $properties = []): void
    {
        $this->logActivity($action, $subject, $properties);
    }

    /**
     * Log a custom action without subject
     */
    protected function logEvent(string $event, array $properties = []): void
    {
        $this->logActivity($event, null, $properties);
    }
}
