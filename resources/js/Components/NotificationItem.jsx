import { Icon } from '@iconify/react';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import { router } from '@inertiajs/react';

const typeConfig = {
    info: {
        icon: 'solar:info-circle-bold-duotone',
        color: 'text-blue-500',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    success: {
        icon: 'solar:check-circle-bold-duotone',
        color: 'text-green-500',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    warning: {
        icon: 'solar:warning-circle-bold-duotone',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    error: {
        icon: 'solar:danger-circle-bold-duotone',
        color: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
};

export default function NotificationItem({ notification, onMarkAsRead, onDelete }) {
    const config = typeConfig[notification.type] || typeConfig.info;
    const isUnread = !notification.is_read;

    const handleClick = () => {
        if (isUnread) {
            onMarkAsRead(notification.id);
        }
        
        if (notification.action_url) {
            router.visit(notification.action_url);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return date.toLocaleDateString();
    };

    return (
        <div 
            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${
                isUnread ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
            }`}
            onClick={handleClick}
        >
            <div className="flex gap-3">
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
                    <Icon icon={config.icon} className={`w-5 h-5 ${config.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {notification.title}
                                </p>
                                {isUnread && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {formatTime(notification.created_at)}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                            {isUnread && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onMarkAsRead(notification.id);
                                    }}
                                    title="Mark as read"
                                >
                                    <Icon icon="solar:check-circle-linear" className="w-4 h-4" />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(notification.id);
                                }}
                                title="Delete"
                            >
                                <Icon icon="solar:trash-bin-trash-linear" className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
