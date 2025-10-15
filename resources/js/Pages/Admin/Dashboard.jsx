import { Icon } from '@iconify/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatsCard from '@/Components/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Link } from '@inertiajs/react';
import { pageBreadcrumbs } from '@/lib/breadcrumbs';

export default function AdminDashboard({ stats, recentActivity, recentOrders }) {
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
                    value={stats.users?.total || 0}
                    change={`${stats.users?.new_this_month || 0} new`}
                    trend="neutral"
                    icon="solar:user-bold-duotone"
                    color="blue"
                />
                <StatsCard
                    title="Total Orders"
                    value={stats.orders?.total || 0}
                    change={`${stats.orders?.growth > 0 ? '+' : ''}${stats.orders?.growth || 0}%`}
                    trend={stats.orders?.growth > 0 ? 'up' : stats.orders?.growth < 0 ? 'down' : 'neutral'}
                    icon="solar:cart-large-2-bold-duotone"
                    color="green"
                />
                <StatsCard
                    title="Pending Invoices"
                    value={stats.invoices?.pending || 0}
                    change={`$${(stats.invoices?.pending_amount || 0).toLocaleString()}`}
                    trend="neutral"
                    icon="solar:bill-list-bold-duotone"
                    color="yellow"
                />
                <StatsCard
                    title="Total Assets"
                    value={stats.assets?.total || 0}
                    change={`$${(stats.assets?.value || 0).toLocaleString()}`}
                    trend="neutral"
                    icon="solar:box-bold-duotone"
                    color="purple"
                />
            </div>

            {/* Secondary Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Working Groups"
                    value={stats.workingGroups?.active || 0}
                    change={`${stats.workingGroups?.total || 0} total`}
                    trend="neutral"
                    icon="solar:users-group-rounded-bold-duotone"
                    color="blue"
                />
                <StatsCard
                    title="Pending Quotes"
                    value={stats.quotes?.pending || 0}
                    change={`${stats.quotes?.this_month || 0} this month`}
                    trend="neutral"
                    icon="solar:document-text-bold-duotone"
                    color="indigo"
                />
                <StatsCard
                    title="Completed Orders"
                    value={stats.orders?.completed || 0}
                    change={`${stats.orders?.pending || 0} pending`}
                    trend="neutral"
                    icon="solar:verified-check-bold-duotone"
                    color="green"
                />
                <StatsCard
                    title="Invoice Revenue"
                    value={`$${((stats.invoices?.paid_amount || 0) / 1000).toFixed(1)}k`}
                    change={`${stats.invoices?.paid || 0} paid`}
                    trend="up"
                    icon="solar:dollar-bold-duotone"
                    color="emerald"
                />
            </div>

            {/* Recent Orders and Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Recent Orders */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Icon icon="solar:cart-large-2-bold-duotone" className="w-5 h-5 text-green-600" />
                                Recent Orders
                            </CardTitle>
                            <Link href="/admin/orders">
                                <Button variant="ghost" size="sm">
                                    View all
                                    <Icon icon="solar:alt-arrow-right-linear" className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentOrders && recentOrders.length > 0 ? (
                            <div className="space-y-3">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                Order #{order.id}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {order.user} • {order.created_at}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                                order.status === 'completed' 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : order.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                                            }`}>
                                                {order.status}
                                            </span>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                ${order.total.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Icon icon="solar:cart-large-2-linear" className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    No recent orders
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

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
            </div>
        </AdminLayout>
    );
}
