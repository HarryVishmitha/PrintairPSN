import { Head, Link } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { Button } from '@/Components/ui/Button';
import { Card, CardContent } from '@/Components/ui/Card';
import { useState } from 'react';

export default function Home({ auth }) {
    const [openMenu, setOpenMenu] = useState(null);

    const menuItems = [
        {
            name: 'Products',
            items: [
                { name: 'Business Cards', icon: 'solar:card-bold-duotone' },
                { name: 'Brochures', icon: 'solar:document-text-bold-duotone' },
                { name: 'Flyers', icon: 'solar:documents-bold-duotone' },
                { name: 'Banners', icon: 'solar:flag-bold-duotone' },
                { name: 'Posters', icon: 'solar:gallery-bold-duotone' },
                { name: 'Stickers', icon: 'solar:sticker-square-bold-duotone' },
            ]
        },
        {
            name: 'Services',
            items: [
                { name: 'Design Services', icon: 'solar:pallete-2-bold-duotone' },
                { name: 'Large Format', icon: 'solar:maximize-square-bold-duotone' },
                { name: 'Custom Printing', icon: 'solar:settings-bold-duotone' },
                { name: 'Bulk Orders', icon: 'solar:box-bold-duotone' },
            ]
        },
        {
            name: 'About',
            items: [
                { name: 'Our Story', icon: 'solar:book-2-bold-duotone' },
                { name: 'Team', icon: 'solar:users-group-rounded-bold-duotone' },
                { name: 'Testimonials', icon: 'solar:chat-square-like-bold-duotone' },
            ]
        }
    ];

    return (
        <>
            <Head title="PrintAir Advertising - Professional Printing Services" />
            
            <div className="min-h-screen bg-white dark:bg-gray-900">
                {/* Mega Menu Navigation */}
                <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-50 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            {/* Logo */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <Icon icon="solar:printer-bold-duotone" className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    PrintAir
                                </span>
                            </div>

                            {/* Nav Links */}
                            <div className="flex items-center gap-4">
                                {auth.user ? (
                                    <Link href={route('dashboard')}>
                                        <Button>
                                            <Icon icon="solar:home-2-bold-duotone" className="w-4 h-4 mr-2" />
                                            Dashboard
                                        </Button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link href={route('login')}>
                                            <Button variant="ghost">
                                                Log in
                                            </Button>
                                        </Link>
                                        <Link href={route('register')}>
                                            <Button>
                                                Get Started
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative py-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center">
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
                                Professional Print
                                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Management System
                                </span>
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                                Streamline your printing operations with our comprehensive platform. 
                                Manage orders, track assets, and collaborate with your team efficiently.
                            </p>
                            <div className="flex gap-4 justify-center flex-wrap">
                                {auth.user ? (
                                    <Link href={route('dashboard')}>
                                        <Button size="lg" className="text-lg px-8 py-6">
                                            <Icon icon="solar:home-2-bold-duotone" className="w-5 h-5 mr-2" />
                                            Go to Dashboard
                                        </Button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link href={route('register')}>
                                            <Button size="lg" className="text-lg px-8 py-6">
                                                <Icon icon="solar:user-plus-bold-duotone" className="w-5 h-5 mr-2" />
                                                Get Started Free
                                            </Button>
                                        </Link>
                                        <Link href={route('login')}>
                                            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                                                <Icon icon="solar:login-2-bold-duotone" className="w-5 h-5 mr-2" />
                                                Sign In
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
                </section>

                {/* Features Section */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Everything You Need
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-300">
                                Powerful features to manage your print business
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <Card className="hover:shadow-xl transition-shadow duration-300">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                                        <Icon icon="solar:cart-large-2-bold-duotone" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <CardTitle>Order Management</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Track and manage all your print orders in one place. Real-time status updates and notifications.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Feature 2 */}
                            <Card className="hover:shadow-xl transition-shadow duration-300">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                                        <Icon icon="solar:users-group-rounded-bold-duotone" className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <CardTitle>Team Collaboration</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Organize your team into working groups with role-based access control and permissions.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Feature 3 */}
                            <Card className="hover:shadow-xl transition-shadow duration-300">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                                        <Icon icon="solar:box-bold-duotone" className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <CardTitle>Asset Management</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Keep track of all your print assets, designs, and resources with our centralized system.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Feature 4 */}
                            <Card className="hover:shadow-xl transition-shadow duration-300">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-4">
                                        <Icon icon="solar:bill-list-bold-duotone" className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <CardTitle>Invoicing & Quotes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Generate professional quotes and invoices. Track payments and manage your finances.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Feature 5 */}
                            <Card className="hover:shadow-xl transition-shadow duration-300">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                                        <Icon icon="solar:history-bold-duotone" className="w-6 h-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <CardTitle>Activity Tracking</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Complete audit trail of all activities. Monitor changes and maintain compliance.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Feature 6 */}
                            <Card className="hover:shadow-xl transition-shadow duration-300">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                                        <Icon icon="solar:notification-unread-bold-duotone" className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <CardTitle>Real-time Notifications</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Stay updated with instant notifications for orders, quotes, and team activities.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                            <div>
                                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">1000+</div>
                                <div className="text-gray-600 dark:text-gray-300">Orders Processed</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">50+</div>
                                <div className="text-gray-600 dark:text-gray-300">Active Teams</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">5000+</div>
                                <div className="text-gray-600 dark:text-gray-300">Assets Managed</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">99.9%</div>
                                <div className="text-gray-600 dark:text-gray-300">Uptime</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-bold text-white mb-6">
                            Ready to Get Started?
                        </h2>
                        <p className="text-xl text-white/90 mb-8">
                            Join hundreds of businesses managing their print operations efficiently with PrintAir.
                        </p>
                        {!auth.user && (
                            <Link href={route('register')}>
                                <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                                    <Icon icon="solar:rocket-2-bold-duotone" className="w-5 h-5 mr-2" />
                                    Start Your Free Trial
                                </Button>
                            </Link>
                        )}
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                        <Icon icon="solar:printer-bold-duotone" className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xl font-bold">PrintAir</span>
                                </div>
                                <p className="text-gray-400">
                                    Professional print management made simple.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-4">Product</h3>
                                <ul className="space-y-2 text-gray-400">
                                    <li><a href="#" className="hover:text-white transition">Features</a></li>
                                    <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                                    <li><a href="#" className="hover:text-white transition">Security</a></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-4">Company</h3>
                                <ul className="space-y-2 text-gray-400">
                                    <li><a href="#" className="hover:text-white transition">About</a></li>
                                    <li><a href="#" className="hover:text-white transition">Blog</a></li>
                                    <li><a href="#" className="hover:text-white transition">Careers</a></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-4">Support</h3>
                                <ul className="space-y-2 text-gray-400">
                                    <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                                    <li><a href="#" className="hover:text-white transition">Contact</a></li>
                                    <li><a href="#" className="hover:text-white transition">Status</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                            <p className="text-gray-400 text-sm">
                                © 2025 PrintAir. All rights reserved.
                            </p>
                            <div className="flex gap-6 mt-4 md:mt-0">
                                <a href="#" className="text-gray-400 hover:text-white transition">
                                    <Icon icon="solar:document-text-bold-duotone" className="w-5 h-5" />
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition">
                                    <Icon icon="solar:shield-check-bold-duotone" className="w-5 h-5" />
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition">
                                    <Icon icon="solar:settings-bold-duotone" className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            <style>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(20px, -50px) scale(1.1); }
                    50% { transform: translate(-20px, 20px) scale(0.9); }
                    75% { transform: translate(50px, 50px) scale(1.05); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </>
    );
}
