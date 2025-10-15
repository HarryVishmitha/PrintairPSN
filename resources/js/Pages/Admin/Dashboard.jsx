import { Icon } from '@iconify/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatsCard from '@/Components/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Link } from '@inertiajs/react';
import { pageBreadcrumbs } from '@/lib/breadcrumbs';

export default function AdminDashboard({ stats, recentActivity }) {
    // Use helper function for consistent breadcrumbs
    const breadcrumbs = pageBreadcrumbs.adminDashboard();

    return (
        <AdminLayout
            title="Admin Dashboard"
            breadcrumbs={breadcrumbs}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Admin Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Welcome back! Here's what's happening today.
                        </p>
                    </div>
                    <Link href="/admin/working-groups/create">
                        <Button>
                            <Icon icon="solar:add-circle-bold-duotone" className="w-5 h-5 mr-2" />
                            New Working Group
                        </Button>
                    </Link>
                </div>
            }
        >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Total Users"
                    value={stats.totalUsers || 0}
                    change="+12%"
                    trend="up"
                    icon="solar:user-bold-duotone"
                    color="blue"
                />
                <StatsCard
                    title="Working Groups"
                    value={stats.totalWorkingGroups || 0}
                    change="+8%"
                    trend="up"
                    icon="solar:users-group-rounded-bold-duotone"
                    color="green"
                />
                <StatsCard
                    title="Active Memberships"
                    value={stats.activeMemberships || 0}
                    change="+23%"
                    trend="up"
                    icon="solar:verified-check-bold-duotone"
                    color="yellow"
                />
                <StatsCard
                    title="Recent Activities"
                    value={stats.recentActivities || 0}
                    change="-5%"
                    trend="down"
                    icon="solar:bolt-circle-bold-duotone"
                    color="red"
                />
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Icon icon="solar:history-bold-duotone" className="w-5 h-5 text-primary" />
                            Recent Activity
                        </CardTitle>
                        <Link href="/admin/activity-log">
                            <Button variant="ghost" size="sm">
                                View all
                                <Icon icon="solar:alt-arrow-right-linear" className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {recentActivity && recentActivity.length > 0 ? (
                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center shadow-md">
                                            <span className="text-sm font-semibold text-white">
                                                {activity.causer?.name?.charAt(0).toUpperCase() || '?'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            <span className="font-semibold">{activity.causer?.name || 'System'}</span>
                                            {' '}
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {activity.description}
                                            </span>
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Icon icon="solar:clock-circle-linear" className="w-3.5 h-3.5 text-gray-400" />
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {activity.created_at}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Icon icon="solar:inbox-line-linear" className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                No recent activity
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
