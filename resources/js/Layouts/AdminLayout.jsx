import { useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import NotificationBell from "@/Components/NotificationBell";
import { ThemeToggle } from "@/Components/ThemeToggle";
import QuickSearch from "@/Components/QuickSearch";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Button } from "@/Components/ui/Button";
import { Separator } from "@/Components/ui/Separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/DropdownMenu";

export default function AdminLayout({ header, title, children, breadcrumbs }) {
    const { url } = usePage();
    const { auth } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const user = auth?.user;

    const navigation = [
        {
            name: "Dashboard",
            href: "/admin",
            icon: "solar:home-2-bold-duotone",
            activeIcon: "solar:home-2-bold",
        },
        {
            name: "Working Groups",
            href: "/admin/working-groups",
            icon: "solar:users-group-rounded-bold-duotone",
            activeIcon: "solar:users-group-rounded-bold",
        },
        {
            name: "Users",
            href: "/admin/users",
            icon: "solar:user-bold-duotone",
            activeIcon: "solar:user-bold",
        },
        {
            name: "Activity Log",
            href: "/admin/activity-log",
            icon: "solar:document-text-bold-duotone",
            activeIcon: "solar:document-text-bold",
        },
        {
            name: "Settings",
            href: "/admin/settings",
            icon: "solar:settings-bold-duotone",
            activeIcon: "solar:settings-bold",
        },
    ];

    const isActive = (href) => {
        if (!url) return false;
        // Exact match for the href
        if (url === href) return true;
        // For child routes, check if URL starts with href followed by "/"
        // But make sure we don't match "/admin" when we're on "/admin/something"
        if (href === "/admin") {
            // Dashboard should only be active on exact match
            return url === "/admin";
        }
        // For other routes, check if it's a child route
        return url.startsWith(href + "/");
    };

    return (
        <>
            {title && <Head title={title} />}

            <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
                {/* Top Brand Bar */}
                <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 flex-shrink-0">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <img
                            src="/assets/logo.png"
                            alt="PrintAir"
                            className="h-10"
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                            }}
                        />
                    </Link>

                    {/* Center - Quick Search */}
                    <div className="flex-1 max-w-2xl mx-8">
                        <QuickSearch />
                    </div>

                    {/* Right Side - Actions & User Info */}
                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* Notifications */}
                        <NotificationBell />

                        {/* Help */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Help & Documentation"
                        >
                            <Icon
                                icon="solar:question-circle-bold-duotone"
                                className="w-6 h-6 text-gray-600 dark:text-gray-300"
                            />
                        </Button>

                        {/* Divider */}
                        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>

                        {/* User Info */}
                        {user && (
                            <>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {user.name}
                                </span>
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white font-semibold text-sm shadow-md">
                                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                            </>
                        )}
                    </div>
                </header>

                {/* Main Layout */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Enhanced Sidebar */}
                    <aside
                        className={`${
                            sidebarOpen ? "w-72" : "w-20"
                        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out flex flex-col`}
                    >
                        {/* Sidebar Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            {sidebarOpen ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                                        <Icon
                                            icon="solar:shield-user-bold"
                                            className="w-6 h-6 text-white"
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-gray-900 dark:text-white">
                                            Admin Console
                                        </h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Management Portal
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                                    <Icon
                                        icon="solar:shield-user-bold"
                                        className="w-6 h-6 text-white"
                                    />
                                </div>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Icon
                                    icon={
                                        sidebarOpen
                                            ? "solar:double-alt-arrow-left-bold-duotone"
                                            : "solar:double-alt-arrow-right-bold-duotone"
                                    }
                                    className="w-5 h-5 text-gray-600 dark:text-gray-400"
                                />
                            </Button>
                        </div>

                        {/* Navigation Links */}
                        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                            {navigation.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                                            active
                                                ? "bg-primary text-white dark:text-black shadow-md"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        }`}
                                    >
                                        <Icon
                                            icon={
                                                active
                                                    ? item.activeIcon
                                                    : item.icon
                                            }
                                            className={`w-5 h-5 flex-shrink-0 ${
                                                active
                                                    ? "text-white dark:text-gray-500"
                                                    : "text-gray-500 dark:text-gray-400 group-hover:text-primary"
                                            }`}
                                        />
                                        {sidebarOpen && (
                                            <span className="font-medium text-sm">
                                                {item.name}
                                            </span>
                                        )}
                                        {active && sidebarOpen && (
                                            <Icon
                                                icon="solar:check-circle-bold"
                                                className="w-4 h-4 ml-auto text-white"
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        <Separator />

                        {/* Quick Actions */}
                        {sidebarOpen && (
                            <div className="p-3">
                                <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Icon
                                            icon="solar:bolt-circle-bold-duotone"
                                            className="w-4 h-4 text-primary"
                                        />
                                        <h3 className="text-xs font-semibold text-gray-900 dark:text-white">
                                            Quick Actions
                                        </h3>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Link
                                            href="/admin/working-groups/create"
                                            className="flex items-center gap-2 text-xs text-primary hover:underline py-1"
                                        >
                                            <Icon
                                                icon="solar:add-circle-bold-duotone"
                                                className="w-3.5 h-3.5"
                                            />
                                            <span>New Working Group</span>
                                        </Link>
                                        <Link
                                            href="/admin/users/invite"
                                            className="flex items-center gap-2 text-xs text-primary hover:underline py-1"
                                        >
                                            <Icon
                                                icon="solar:user-plus-bold-duotone"
                                                className="w-3.5 h-3.5"
                                            />
                                            <span>Invite User</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* User Profile Section */}
                        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                            {user && sidebarOpen ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                                                {user.name
                                                    ?.charAt(0)
                                                    ?.toUpperCase() || "U"}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {user.name || "User"}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {user.email || ""}
                                                </p>
                                            </div>
                                            <Icon
                                                icon="solar:alt-arrow-down-linear"
                                                className="w-4 h-4 text-gray-400"
                                            />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-56"
                                    >
                                        <DropdownMenuLabel>
                                            My Account
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/profile"
                                                className="cursor-pointer"
                                            >
                                                <Icon
                                                    icon="solar:user-circle-bold-duotone"
                                                    className="w-4 h-4 mr-2"
                                                />
                                                Profile
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/settings"
                                                className="cursor-pointer"
                                            >
                                                <Icon
                                                    icon="solar:settings-bold-duotone"
                                                    className="w-4 h-4 mr-2"
                                                />
                                                Settings
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/logout"
                                                method="post"
                                                as="button"
                                                className="cursor-pointer w-full text-red-600"
                                            >
                                                <Icon
                                                    icon="solar:logout-2-bold-duotone"
                                                    className="w-4 h-4 mr-2"
                                                />
                                                Logout
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : user ? (
                                <Link href="/profile">
                                    <div className="w-9 h-9 mx-auto rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md hover:shadow-lg transition-shadow">
                                        {user.name?.charAt(0)?.toUpperCase() ||
                                            "U"}
                                    </div>
                                </Link>
                            ) : null}
                        </div>
                    </aside>

                    {/* Main Content Area - All scrollable together */}
                    <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                        {/* Breadcrumbs - Subtle */}
                        {breadcrumbs && (
                            <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-2 sticky top-0 z-10">
                                <Breadcrumbs items={breadcrumbs} />
                            </div>
                        )}
                        {/* Page Header (Optional) */}
                        {header && (
                            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 m-3 rounded-lg">
                                <div className="px-6 py-4">{header}</div>
                            </div>
                        )}
                        {/* Page Content */}
                        <div className="p-6">{children}</div>
                    </main>
                </div>
            </div>
        </>
    );
}
