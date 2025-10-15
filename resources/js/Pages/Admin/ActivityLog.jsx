import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/Select';
import { Badge } from '@/Components/ui/Badge';
import { pageBreadcrumbs } from '@/lib/breadcrumbs';
import { cn } from '@/lib/utils';

export default function ActivityLog({ activities, users, logNames, subjectTypes, filters }) {
    const breadcrumbs = pageBreadcrumbs.adminActivityLog();
    
    const [search, setSearch] = useState(filters.search || '');
    const [causer, setCauser] = useState(filters.causer || '');
    const [subjectType, setSubjectType] = useState(filters.subject_type || '');
    const [logName, setLogName] = useState(filters.log_name || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [expandedRows, setExpandedRows] = useState(new Set());

    const handleFilter = () => {
        router.get(
            route('admin.activity-log'),
            {
                search,
                causer: (causer && causer !== 'all') ? causer : undefined,
                subject_type: (subjectType && subjectType !== 'all') ? subjectType : undefined,
                log_name: (logName && logName !== 'all') ? logName : undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleReset = () => {
        setSearch('');
        setCauser('all');
        setSubjectType('all');
        setLogName('all');
        setDateFrom('');
        setDateTo('');
        router.get(route('admin.activity-log'));
    };

    const toggleRow = (id) => {
        setExpandedRows((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const getEventColor = (description) => {
        if (description.includes('created')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        if (description.includes('updated')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        if (description.includes('deleted')) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    };

    const getSubjectTypeIcon = (type) => {
        if (!type) return 'solar:document-bold-duotone';
        const lowerType = type.toLowerCase();
        if (lowerType.includes('user')) return 'solar:user-bold-duotone';
        if (lowerType.includes('order')) return 'solar:cart-large-2-bold-duotone';
        if (lowerType.includes('invoice')) return 'solar:bill-list-bold-duotone';
        if (lowerType.includes('quote')) return 'solar:document-text-bold-duotone';
        if (lowerType.includes('asset')) return 'solar:box-bold-duotone';
        if (lowerType.includes('working')) return 'solar:users-group-rounded-bold-duotone';
        return 'solar:document-bold-duotone';
    };

    return (
        <AdminLayout
            title="Activity Log"
            breadcrumbs={breadcrumbs}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Activity Log
                        </h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Track all system activities and changes
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Activity Log" />

            {/* Filters */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Icon icon="solar:filter-bold-duotone" className="w-5 h-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="search">Search</Label>
                            <Input
                                id="search"
                                placeholder="Search description..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                            />
                        </div>

                        <div>
                            <Label htmlFor="causer">User</Label>
                            <Select value={causer || 'all'} onValueChange={setCauser}>
                                <SelectTrigger id="causer">
                                    <SelectValue placeholder="All users" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All users</SelectItem>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id.toString()}>
                                            {user.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="subjectType">Subject Type</Label>
                            <Select value={subjectType || 'all'} onValueChange={setSubjectType}>
                                <SelectTrigger id="subjectType">
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All types</SelectItem>
                                    {subjectTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="logName">Log Name</Label>
                            <Select value={logName || 'all'} onValueChange={setLogName}>
                                <SelectTrigger id="logName">
                                    <SelectValue placeholder="All logs" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All logs</SelectItem>
                                    {logNames.map((name) => (
                                        <SelectItem key={name} value={name}>
                                            {name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="dateFrom">From Date</Label>
                            <Input
                                id="dateFrom"
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="dateTo">To Date</Label>
                            <Input
                                id="dateTo"
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <Button onClick={handleFilter}>
                            <Icon icon="solar:magnifer-bold-duotone" className="w-4 h-4 mr-2" />
                            Apply Filters
                        </Button>
                        <Button variant="outline" onClick={handleReset}>
                            <Icon icon="solar:refresh-bold-duotone" className="w-4 h-4 mr-2" />
                            Reset
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Activity List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Icon icon="solar:history-bold-duotone" className="w-5 h-5" />
                            Activities
                        </span>
                        <span className="text-sm font-normal text-gray-500">
                            {activities.total} total
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {activities.data.length === 0 ? (
                        <div className="text-center py-12">
                            <Icon
                                icon="solar:inbox-line-bold-duotone"
                                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                            />
                            <p className="text-gray-600 dark:text-gray-400">
                                No activities found
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activities.data.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="mt-1">
                                                <Icon
                                                    icon={getSubjectTypeIcon(activity.subject_type)}
                                                    className="w-6 h-6 text-gray-500"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <Badge
                                                        className={cn('text-xs', getEventColor(activity.description))}
                                                    >
                                                        {activity.description}
                                                    </Badge>
                                                    {activity.subject_type && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {activity.subject_type}
                                                            {activity.subject_id && ` #${activity.subject_id}`}
                                                        </Badge>
                                                    )}
                                                    {activity.log_name && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {activity.log_name}
                                                        </Badge>
                                                    )}
                                                </div>
                                                
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                    {activity.causer ? (
                                                        <>
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {activity.causer.name}
                                                            </span>
                                                            {' '}
                                                            <span className="text-xs text-gray-500">
                                                                ({activity.causer.email})
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-500">System</span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Icon icon="solar:clock-circle-bold-duotone" className="w-4 h-4" />
                                                    {activity.created_at_human}
                                                    <span className="text-gray-400">•</span>
                                                    {activity.created_at}
                                                </div>

                                                {/* Properties Toggle */}
                                                {activity.properties && Object.keys(activity.properties).length > 0 && (
                                                    <div className="mt-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleRow(activity.id)}
                                                            className="h-auto py-1 px-2 text-xs"
                                                        >
                                                            <Icon
                                                                icon={
                                                                    expandedRows.has(activity.id)
                                                                        ? 'solar:alt-arrow-up-bold'
                                                                        : 'solar:alt-arrow-down-bold'
                                                                }
                                                                className="w-3 h-3 mr-1"
                                                            />
                                                            {expandedRows.has(activity.id) ? 'Hide' : 'Show'} Details
                                                        </Button>
                                                    </div>
                                                )}

                                                {/* Expanded Properties */}
                                                {expandedRows.has(activity.id) && activity.properties && (
                                                    <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-900 rounded-md">
                                                        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                            Details:
                                                        </h4>
                                                        <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                                                            {JSON.stringify(activity.properties, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {activities.last_page > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Showing {((activities.current_page - 1) * activities.per_page) + 1} to{' '}
                                {Math.min(activities.current_page * activities.per_page, activities.total)} of{' '}
                                {activities.total} results
                            </div>
                            <div className="flex gap-2">
                                {activities.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
