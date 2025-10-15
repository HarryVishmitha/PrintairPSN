import { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function UsersCreate({ roles, workingGroups }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'member',
        working_groups: [],
        is_active: true,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.users.store'));
    };

    const handleWorkingGroupToggle = (groupId) => {
        const currentGroups = data.working_groups;
        if (currentGroups.includes(groupId)) {
            setData('working_groups', currentGroups.filter(id => id !== groupId));
        } else {
            setData('working_groups', [...currentGroups, groupId]);
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Create New User
                        </h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Add a new user to the system
                        </p>
                    </div>
                    <Link
                        href={route('admin.users.index')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                        <Icon icon="solar:arrow-left-bold" className="w-4 h-4" />
                        Back to Users
                    </Link>
                </div>
            }
        >
            <div className="max-w-3xl">
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Full Name *
                        </label>
                        <div className="relative">
                            <Icon icon="solar:user-bold-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                placeholder="Enter full name"
                            />
                        </div>
                        {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email Address *
                        </label>
                        <div className="relative">
                            <Icon icon="solar:letter-bold-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                id="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                placeholder="Enter email address"
                            />
                        </div>
                        {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Password *
                        </label>
                        <div className="relative">
                            <Icon icon="solar:lock-password-bold-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className={`w-full pl-10 pr-12 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                placeholder="Enter password (min. 8 characters)"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <Icon icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} className="w-5 h-5" />
                            </button>
                        </div>
                        {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
                    </div>

                    {/* Password Confirmation */}
                    <div>
                        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Confirm Password *
                        </label>
                        <div className="relative">
                            <Icon icon="solar:lock-password-bold-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPasswordConfirmation ? 'text' : 'password'}
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className={`w-full pl-10 pr-12 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.password_confirmation ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                placeholder="Confirm password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <Icon icon={showPasswordConfirmation ? 'solar:eye-bold' : 'solar:eye-closed-bold'} className="w-5 h-5" />
                            </button>
                        </div>
                        {errors.password_confirmation && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password_confirmation}</p>}
                    </div>

                    {/* Role */}
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            User Role *
                        </label>
                        <div className="relative">
                            <Icon icon="solar:shield-user-bold-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                id="role"
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.role ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                            >
                                {roles.map((role) => (
                                    <option key={role.id} value={role.name}>
                                        {role.name.replace('_', ' ').toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {errors.role && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.role}</p>}
                    </div>

                    {/* Working Groups */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Working Groups
                        </label>
                        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50 max-h-48 overflow-y-auto">
                            {workingGroups.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                                    No working groups available
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {workingGroups.map((group) => (
                                        <label
                                            key={group.id}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={data.working_groups.includes(group.id)}
                                                onChange={() => handleWorkingGroupToggle(group.id)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-900 dark:text-white">{group.name}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        {errors.working_groups && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.working_groups}</p>}
                    </div>

                    {/* Active Status */}
                    <div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Active Account
                                </span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    User can log in and access the system
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                        >
                            {processing ? (
                                <>
                                    <Icon icon="solar:loading-bold-duotone" className="w-5 h-5 animate-spin" />
                                    Creating User...
                                </>
                            ) : (
                                <>
                                    <Icon icon="solar:user-plus-bold-duotone" className="w-5 h-5" />
                                    Create User
                                </>
                            )}
                        </button>
                        <Link
                            href={route('admin.users.index')}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
