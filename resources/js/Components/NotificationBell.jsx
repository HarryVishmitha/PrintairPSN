import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import NotificationPanel from './NotificationPanel';
import axios from 'axios';

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/notifications/recent');
            setNotifications(response.data);
            
            const countResponse = await axios.get('/notifications/unread-count');
            setUnreadCount(countResponse.data.count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (notificationId) => {
        try {
            await axios.post(`/notifications/${notificationId}/read`);
            await fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await axios.post('/notifications/mark-all-read');
            await fetchNotifications();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const handleDelete = async (notificationId) => {
        try {
            await axios.delete(`/notifications/${notificationId}`);
            await fetchNotifications();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleTestNotification = async () => {
        try {
            await axios.post('/notifications/test');
            setTimeout(fetchNotifications, 500);
        } catch (error) {
            console.error('Error creating test notification:', error);
        }
    };

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Icon 
                    icon="solar:bell-bold-duotone" 
                    className="w-6 h-6 text-gray-600 dark:text-gray-300"
                />
                {unreadCount > 0 && (
                    <Badge 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-500"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                )}
            </Button>

            <NotificationPanel
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                notifications={notifications}
                loading={loading}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onDelete={handleDelete}
                onTestNotification={handleTestNotification}
            />
        </div>
    );
}
