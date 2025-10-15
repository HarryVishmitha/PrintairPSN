import { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function UsersIndex({ users, roles, workingGroups, filters: initialFilters }) {
    const [filters, setFilters] = useState({
        search: initialFilters?.search || '',
        role: initialFilters?.role || '',
        working_group: initialFilters?.working_group || '',
        status: initialFilters?.status || '',
    });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });
    const [editRoleDialog, setEditRoleDialog] = useState({ open: false, user: null, currentRole: '' });

    // Debounced search using Inertia
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route('admin.users.index'), filters, {
                preserveState: true,
                preserveScroll: true,
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [filters]);

    const handleDelete = (id, name) => {
        setDeleteDialog({ open: true, id, name });
    };

    const confirmDelete = () => {
        router.delete(route('admin.users.destroy', deleteDialog.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteDialog({ open: false, id: null, name: '' });
            },
        });
    };

    const handleRoleChange = (newRole) => {
        router.patch(route('admin.users.update-role', editRoleDialog.user.id), {
            role: newRole,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditRoleDialog({ open: false, user: null, currentRole: '' });
            },
        });
    };

    const toggleUserStatus = (userId) => {
        router.patch(route('admin.users.toggle-status', userId), {}, {
            preserveScroll: true,
        });
    };

    const getRoleBadge = (role) => {
        const colors = {
            super_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            designer: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
            marketing: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
            member: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
        };
        return colors[role] || colors.member;
    };

    const getRoleIcon = (role) => {
        const icons = {
            super_admin: 'solar:crown-star-bold-duotone',
            admin: 'solar:shield-user-bold-duotone',
            manager: 'solar:user-check-bold-duotone',
            designer: 'solar:palette-bold-duotone',
            marketing: 'solar:chart-bold-duotone',
            member: 'solar:user-bold-duotone',
        };
        return icons[role] || icons.member;
    };

    return (
        <AdminLayout
            title="Users Management"
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Users Management
                        </h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Manage all users, roles, and permissions
                        </p>
                    </div>
                    {/* Temporarily disabled until Create page is built */}
                    {/* <Link
                        href={route('admin.users.create')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                        <Icon icon="solar:user-plus-bold-duotone" className="w-5 h-5" />
                        Invite User
                    </Link> */}
                </div>
            }
        >
            {/* Filters */}
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Icon icon="solar:magnifer-bold-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Role Filter */}
                    <select
                        value={filters.role}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Roles</option>
                        {roles.map((role) => (
                            <option key={role.id} value={role.name}>
                                {role.name.replace('_', ' ').toUpperCase()}
                            </option>
                        ))}
                    </select>

                    {/* Working Group Filter */}
                    <select
                        value={filters.working_group}
                        onChange={(e) => setFilters({ ...filters, working_group: e.target.value })}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Groups</option>
                        {workingGroups.map((group) => (
                            <option key={group.id} value={group.id}>
                                {group.name}
                            </option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Working Groups
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Joined
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {users.data.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center">
                                    <Icon icon="solar:users-group-rounded-bold-duotone" className="w-16 h-16 mx-auto text-gray-400 mb-3" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        No users found. Try adjusting your filters.
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            users.data.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {user.name}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded ${getRoleBadge(user.primary_role)}`}>
                                            <Icon icon={getRoleIcon(user.primary_role)} className="w-3.5 h-3.5" />
                                            {user.primary_role?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                                            <Icon icon="solar:users-group-rounded-bold-duotone" className="w-4 h-4" />
                                            {user.working_groups_count} groups
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => toggleUserStatus(user.id)}
                                            className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded transition-colors ${
                                                user.is_active
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            <Icon 
                                                icon={user.is_active ? 'solar:check-circle-bold-duotone' : 'solar:close-circle-bold-duotone'} 
                                                className="w-3.5 h-3.5" 
                                            />
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {user.created_at}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setEditRoleDialog({ open: true, user, currentRole: user.primary_role })}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                                                title="Change Role"
                                            >
                                                <Icon icon="solar:shield-user-bold-duotone" className="w-4 h-4" />
                                                Role
                                            </button>
                                            {/* Temporarily disabled until Edit page is built */}
                                            {/* <Link
                                                href={route('admin.users.edit', user.id)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Icon icon="solar:pen-bold-duotone" className="w-4 h-4" />
                                                Edit
                                            </Link> */}
                                            <button
                                                onClick={() => handleDelete(user.id, user.name)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                Showing <span className="font-medium">{users.from}</span> to{' '}
                                <span className="font-medium">{users.to}</span> of{' '}
                                <span className="font-medium">{users.total}</span> results
                            </div>
                            <div className="flex gap-2">
                                {users.prev_page_url && (
                                    <Link
                                        href={users.prev_page_url}
                                        preserveScroll
                                        className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600"
                                    >
                                        <Icon icon="solar:arrow-left-bold" className="w-4 h-4" />
                                    </Link>
                                )}
                                {Array.from({ length: Math.min(users.last_page, 5) }, (_, i) => {
                                    let page = i + 1;
                                    if (users.last_page > 5) {
                                        if (users.current_page > 3) {
                                            page = users.current_page - 2 + i;
                                        }
                                        if (page > users.last_page) return null;
                                    }
                                    return (
                                        <Link
                                            key={page}
                                            href={`${route('admin.users.index')}?page=${page}`}
                                            preserveScroll
                                            className={`px-3 py-1.5 text-sm rounded-lg ${
                                                page === users.current_page
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                                            }`}
                                        >
                                            {page}
                                        </Link>
                                    );
                                })}
                                {users.next_page_url && (
                                    <Link
                                        href={users.next_page_url}
                                        preserveScroll
                                        className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600"
                                    >
                                        <Icon icon="solar:arrow-right-bold" className="w-4 h-4" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            {deleteDialog.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                <Icon icon="solar:danger-triangle-bold-duotone" className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Delete User
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

            {/* Edit Role Dialog */}
            {editRoleDialog.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                <Icon icon="solar:shield-user-bold-duotone" className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Change User Role
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {editRoleDialog.user?.name}
                                </p>
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select New Role
                            </label>
                            <select
                                value={editRoleDialog.currentRole || editRoleDialog.user?.primary_role}
                                onChange={(e) => setEditRoleDialog({ ...editRoleDialog, currentRole: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                {roles.map((role) => (
                                    <option key={role.id} value={role.name}>
                                        {role.name.replace('_', ' ').toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setEditRoleDialog({ open: false, user: null, currentRole: '' })}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleRoleChange(editRoleDialog.currentRole)}
                                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-sm"
                            >
                                Update Role
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
