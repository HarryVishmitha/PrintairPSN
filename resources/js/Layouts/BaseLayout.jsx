import { Head, Link, usePage } from '@inertiajs/react';
import WorkingGroupSwitcher from '@/Components/WorkingGroupSwitcher';

export default function BaseLayout({ header, title, children }) {
    const { auth, currentWorkingGroup } = usePage().props;
    const user = auth.user;

    return (
        <>
            {title && <Head title={title} />}
            
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Top Navigation Bar */}
                <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            {/* Logo & Brand */}
                            <div className="flex items-center">
                                <Link href="/" className="flex items-center">
                                    <img 
                                        src="/assets/logo-XXL.png" 
                                        alt="PrintAir" 
                                        className="h-8 w-auto"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                </Link>
                            </div>

                            {/* Right Side - User Menu */}
                            <div className="flex items-center space-x-4">
                                {/* Working Group Switcher */}
                                {currentWorkingGroup && <WorkingGroupSwitcher />}

                                {/* User Info */}
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {user.name}
                                    </span>
                                    <Link 
                                        href="/profile" 
                                        className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
                                    >
                                        {user.name.charAt(0).toUpperCase()}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Page Header */}
                {header && (
                    <header className="bg-white dark:bg-gray-800 shadow">
                        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                {/* Main Content */}
                <main className="py-6">
                    {children}
                </main>
            </div>
        </>
    );
}
