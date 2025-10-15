import { Link, router } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/Button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/AlertDialog';
import { useState } from 'react';

export default function WorkingGroupsIndex({ workingGroups }) {
    const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });

    const handleDelete = (id, name) => {
        setDeleteDialog({ open: true, id, name });
    };

    const confirmDelete = () => {
        router.delete(route('admin.working-groups.destroy', deleteDialog.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteDialog({ open: false, id: null, name: '' }),
        });
    };

    const getStatusBadge = (status) => {
        const colors = {
            active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
            suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };
        return colors[status] || colors.inactive;
    };

    const getTypeBadge = (type) => {
        const colors = {
            public: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            private: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            company: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        };
        return colors[type] || colors.public;
    };

    const getTypeIcon = (type) => {
        const icons = {
            public: 'solar:global-bold-duotone',
            private: 'solar:lock-bold-duotone',
            company: 'solar:buildings-2-bold-duotone',
        };
        return icons[type] || icons.public;
    };

    const getStatusIcon = (status) => {
        const icons = {
            active: 'solar:check-circle-bold-duotone',
            inactive: 'solar:pause-circle-bold-duotone',
            suspended: 'solar:close-circle-bold-duotone',
        };
        return icons[status] || icons.inactive;
    };

    return (
        <AdminLayout
            title="Working Groups"
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Working Groups
                        </h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Manage all working groups and their members
                        </p>
                    </div>
                    <Link
                        href={route('admin.working-groups.create')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                        <Icon icon="solar:add-circle-bold-duotone" className="w-5 h-5" />
                        Create Working Group
                    </Link>
                </div>
            }
        >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Members
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {workingGroups.data.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No working groups found. Create one to get started.
                                </td>
                            </tr>
                        ) : (
                            workingGroups.data.map((group) => (
                                <tr key={group.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {group.name}
                                                {group.is_public_default && (
                                                    <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            {group.description && (
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {group.description}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded ${getTypeBadge(group.type)}`}>
                                            <Icon icon={getTypeIcon(group.type)} className="w-3.5 h-3.5" />
                                            {group.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded ${getStatusBadge(group.status)}`}>
                                            <Icon icon={getStatusIcon(group.status)} className="w-3.5 h-3.5" />
                                            {group.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        <Link
                                            href={route('admin.working-groups.members', group.id)}
                                            className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            <Icon icon="solar:users-group-rounded-bold-duotone" className="w-4 h-4" />
                                            {group.memberships_count} members
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={route('admin.working-groups.members', group.id)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                                title="Manage Members"
                                            >
                                                <Icon icon="solar:users-group-rounded-bold-duotone" className="w-4 h-4" />
                                                Members
                                            </Link>
                                            <Link
                                                href={route('admin.working-groups.edit', group.id)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Icon icon="solar:pen-bold-duotone" className="w-4 h-4" />
                                                Edit
                                            </Link>
                                            {!group.is_public_default && (
                                                <button
                                                    onClick={() => handleDelete(group.id, group.name)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {workingGroups.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                Showing <span className="font-medium">{workingGroups.from}</span> to{' '}
                                <span className="font-medium">{workingGroups.to}</span> of{' '}
                                <span className="font-medium">{workingGroups.total}</span> results
                            </div>
                            <div className="flex space-x-2">
                                {workingGroups.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        disabled={!link.url}
                                        className={`px-3 py-1 text-sm rounded ${
                                            link.active
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Delete Confirmation Dialog */}
            {deleteDialog.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                <Icon icon="solar:danger-triangle-bold-duotone" className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Delete Working Group
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    This action cannot be undone
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                            Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{deleteDialog.name}"</span>? All associated data will be permanently removed.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteDialog({ open: false, id: null, name: '' })}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                            >
                                Delete Permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
