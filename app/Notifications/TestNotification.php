<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TestNotification extends Notification
{
    use Queueable;

    public function __construct(
        private string $type = 'info'
    ) {}

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        $messages = [
            'info' => 'You have a new informational message',
            'success' => 'Your action was completed successfully!',
            'warning' => 'Please review this important warning',
            'error' => 'An error occurred that needs your attention',
        ];

        return [
            'type' => $this->type,
            'title' => ucfirst($this->type) . ' Notification',
            'message' => $messages[$this->type] ?? 'Test notification created at ' . now()->format('H:i:s'),
            'action_url' => '/admin',
        ];
    }
}
