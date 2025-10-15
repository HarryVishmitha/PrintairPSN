import { Icon } from '@iconify/react';
import { Card, CardContent } from '@/Components/ui/Card';

export default function StatsCard({ title, value, change, icon, trend = 'up', color = 'blue' }) {
    const colorClasses = {
        blue: {
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            icon: 'text-blue-600 dark:text-blue-400',
            trend: 'text-blue-600 dark:text-blue-400',
        },
        green: {
            bg: 'bg-green-50 dark:bg-green-900/20',
            icon: 'text-green-600 dark:text-green-400',
            trend: 'text-green-600 dark:text-green-400',
        },
        yellow: {
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            icon: 'text-yellow-600 dark:text-yellow-400',
            trend: 'text-yellow-600 dark:text-yellow-400',
        },
        red: {
            bg: 'bg-red-50 dark:bg-red-900/20',
            icon: 'text-red-600 dark:text-red-400',
            trend: 'text-red-600 dark:text-red-400',
        },
    };

    const colors = colorClasses[color] || colorClasses.blue;

    return (
        <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {title}
                        </p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {value}
                        </h3>
                        {change && (
                            <div className="flex items-center gap-1">
                                <Icon
                                    icon={trend === 'up' ? 'solar:arrow-up-linear' : 'solar:arrow-down-linear'}
                                    className={`w-4 h-4 ${colors.trend}`}
                                />
                                <span className={`text-sm font-medium ${colors.trend}`}>
                                    {change}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    vs last month
                                </span>
                            </div>
                        )}
                    </div>
                    <div className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center`}>
                        <Icon icon={icon} className={`w-7 h-7 ${colors.icon}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
