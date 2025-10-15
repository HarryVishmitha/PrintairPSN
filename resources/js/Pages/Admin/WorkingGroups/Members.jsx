import { useState } from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function WorkingGroupMembers({ workingGroup, availableUsers, roles }) {
    const [showAddMember, setShowAddMember] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: '',
        role: 'member',
    });

    const handleAddMember = (e) => {
        e.preventDefault();
        post(route('admin.working-groups.members.add', workingGroup.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowAddMember(false);
            },
        });
    };

    const handleUpdateRole = (membershipId, newRole) => {
        router.patch(
            route('admin.working-groups.members.update', [workingGroup.id, membershipId]),
            { role: newRole },
            { preserveScroll: true }
        );
    };

    const handleRemoveMember = (membershipId, userName) => {
        if (confirm(`Are you sure you want to remove ${userName} from this working group?`)) {
            router.delete(
                route('admin.working-groups.members.remove', [workingGroup.id, membershipId]),
                { preserveScroll: true }
            );
        }
    };

    const getRoleBadge = (role) => {
        const colors = {
            'super-admin': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            'admin': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'manager': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'designer': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            'marketing': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
            'member': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
        };
        return colors[role] || colors.member;
    };

    return (
        <AdminLayout
            title={`Members - ${workingGroup.name}`}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-2">
                            <Link
                                href={route('admin.working-groups.index')}
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {workingGroup.name} Members
                            </h1>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Manage members and their roles in this working group
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddMember(!showAddMember)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        Add Member
                    </button>
                </div>
            }
        >
            {/* Add Member Form */}
            {showAddMember && (
                <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Add New Member
                    </h3>
                    <form onSubmit={handleAddMember} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    User <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.user_id}
                                    onChange={(e) => setData('user_id', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">Select a user</option>
                                    {availableUsers.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                                {errors.user_id && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.user_id}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    {roles.map((role) => (
                                        <option key={role.value} value={role.value}>
                                            {role.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.role && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.role}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddMember(false);
                                    reset();
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {processing ? 'Adding...' : 'Add Member'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Members List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Member
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Role
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
                        {workingGroup.memberships.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No members in this working group yet.
                                </td>
                            </tr>
                        ) : (
                            workingGroup.memberships.map((membership) => (
                                <tr key={membership.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {membership.user.name}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {membership.user.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={membership.role}
                                            onChange={(e) => handleUpdateRole(membership.id, e.target.value)}
                                            className={`px-2 py-1 text-xs font-medium rounded border-0 ${getRoleBadge(membership.role)}`}
                                        >
                                            {roles.map((role) => (
                                                <option key={role.value} value={role.value}>
                                                    {role.label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(membership.joined_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleRemoveMember(membership.id, membership.user.name)}
                                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
