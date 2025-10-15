import { useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/Components/ui/Button';
import { Separator } from '@/Components/ui/Separator';
import NotificationItem from './NotificationItem';

export default function NotificationPanel({
    isOpen,
    onClose,
    notifications,
    loading,
    onMarkAsRead,
    onMarkAllAsRead,
    onDelete,
    onTestNotification,
}) {
    const panelRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const unreadNotifications = notifications.filter(n => !n.is_read);
    const hasUnread = unreadNotifications.length > 0;

    return (
        <div 
            ref={panelRef}
            className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-in slide-in-from-top-2 duration-200"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <Icon icon="solar:bell-bold-duotone" className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        Notifications
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    {hasUnread && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onMarkAllAsRead}
                            className="text-xs"
                        >
                            Mark all read
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8"
                    >
                        <Icon icon="material-symbols:close" className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <Icon 
                            icon="svg-spinners:ring-resize" 
                            className="w-8 h-8 text-primary"
                        />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <Icon 
                            icon="solar:inbox-line-linear" 
                            className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-3"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No notifications yet
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onTestNotification}
                            className="mt-3"
                        >
                            Create Test Notification
                        </Button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={onMarkAsRead}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <>
                    <Separator />
                    <div className="p-3 text-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-primary hover:text-primary"
                            onClick={() => {
                                window.location.href = '/admin/notifications';
                                onClose();
                            }}
                        >
                            View all notifications
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
