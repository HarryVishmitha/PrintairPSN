import { Head, Link } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { Button } from '@/Components/ui/Button';
import { Card, CardContent } from '@/Components/ui/Card';
import TopNavBar from '@/Components/Navigation/TopNavBar';

export default function Home({ auth, categories = [] }) {
    const trendingProducts = [
        { name: 'X-Banner with Stand', image: '📐', price: '2,950.00', views: 206, description: 'High-quality X-Banner with Stand in 5x2ft (Standard) and 5x2.5ft (Grade B) sizes.' },
        { name: 'Land for Sale Banners', image: '🏞️', price: '350.00', views: 82, description: 'Custom Land for Sale banners printed in vivid colors on durable outdoor material.' },
    ];

    const popularCategories = [
        { name: 'Canvas', image: '🎨' },
        { name: 'Business', image: '💼' },
        { name: 'Quick Products', image: '⚡' },
    ];

    return (
        <>
            <Head title="PrintAir Advertising - Professional Printing Services in Sri Lanka" />
            
            <div className="min-h-screen bg-white dark:bg-gray-900">
                {/* Top Navigation Bar */}
                <TopNavBar auth={auth} categories={categories} />

                {/* Hero Section */}
                <section className="bg-gradient-to-r from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 py-16 md:py-24 relative overflow-hidden">
                    <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center px-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl lg:text-8xl font-extrabold text-gray-800 dark:text-white leading-tight mb-6">
                                Bring Your <span className="text-red-500">Print Ideas</span> to Life
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 leading-relaxed">
                                Explore high-quality custom printing solutions for all your business and personal needs — fast delivery, stunning results.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link href="/products">
                                    <Button className="bg-red-500 text-white hover:bg-red-600">
                                        Start Designing
                                    </Button>
                                </Link>
                                <Link href="/quote">
                                    <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                                        Ask for Quote
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="relative z-10">
                            <div className="absolute bg-red-500/10 w-[300px] h-[300px] rounded-full z-0 top-[-60px] left-[-60px] blur-3xl"></div>
                            <div className="relative z-10 flex items-center justify-center">
                                {/* <Icon icon="solar:printer-bold-duotone" className="w-64 h-64 text-red-500 opacity-20" /> */}
                                <img src="/assets/printing-machine.png" alt="print machine" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Popular Categories */}
                <section className="relative bg-white dark:bg-gray-800 overflow-hidden py-10">
                    <div className="container px-4">
                        <h1 className="text-4xl font-bold mb-8 text-[#f44032]">Popular Categories</h1>
                    </div>
                    <div className="flex gap-4 px-4 justify-center">
                        {popularCategories.map((category, idx) => (
                            <div key={idx} className="cursor-pointer w-[160px] h-[200px] rounded-xl overflow-hidden shadow-lg relative flex-shrink-0 group hover:shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-6xl">
                                    {category.image}
                                </div>
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50">
                                    <span className="text-white font-semibold text-center text-lg">{category.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Trending Products */}
                <section className="bg-gray-50 dark:bg-gray-900 py-16">
                    <div className="mx-auto px-4">
                        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-gray-900 dark:text-white">Trending Products</h2>
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {trendingProducts.map((product, idx) => (
                                <Card key={idx} className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all flex flex-col h-full border border-gray-200 dark:border-gray-700">
                                    <Link href={`/product/${idx}`} className="block">
                                        <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 h-48 flex items-center justify-center text-6xl">
                                            {product.image}
                                        </div>
                                    </Link>
                                    <CardContent className="p-5 flex flex-col flex-1 h-full">
                                        <h6 className="text-xl font-semibold leading-tight mb-1 line-clamp-1 text-gray-900 dark:text-white">
                                            <Link href={`/product/${idx}`}>{product.name}</Link>
                                        </h6>
                                        <div className="flex items-center mb-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Icon key={i} icon="solar:star-bold" className="w-4 h-4 text-yellow-400" />
                                            ))}
                                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({product.views} views)</span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-3">{product.description}</p>
                                        <div className="flex items-center justify-between mt-auto">
                                            <div>
                                                <span className="font-bold text-red-500 text-sm">LKR {product.price}</span>
                                            </div>
                                            <Button size="sm" className="bg-red-500 text-white hover:bg-red-600">
                                                Order Now
                                            </Button>
                                        </div>
                                        <span className="text-xs text-gray-400 ml-2 mt-2">In Stock</span>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Why Choose PrintAir */}
                <section className="relative w-full py-24 bg-white dark:bg-gray-800">
                    <div className="relative mx-auto max-w-7xl px-4">
                        <h2 className="text-4xl md:text-5xl font-bold text-center mb-14 text-gray-900 dark:text-white">
                            Why Choose <span className="text-red-500">PrintAir Advertising?</span>
                        </h2>
                        <div className="grid md:grid-cols-3 gap-10">
                            <Card className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[300px] hover:shadow-xl transition duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
                                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-5">
                                    <Icon icon="solar:rocket-2-bold-duotone" className="text-red-500 text-3xl" />
                                </div>
                                <h4 className="text-xl font-semibold mb-2 leading-tight text-gray-900 dark:text-white">Fast Delivery</h4>
                                <p className="text-gray-600 dark:text-gray-400">Get your orders printed and delivered in record time.</p>
                            </Card>

                            <Card className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[300px] hover:shadow-xl transition duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
                                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-5">
                                    <Icon icon="solar:star-bold-duotone" className="text-red-500 text-3xl" />
                                </div>
                                <h4 className="text-xl font-semibold mb-2 leading-tight text-gray-900 dark:text-white">Premium Quality</h4>
                                <p className="text-gray-600 dark:text-gray-400">We use only the highest quality materials for your prints.</p>
                            </Card>

                            <Card className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[300px] hover:shadow-xl transition duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
                                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-5">
                                    <Icon icon="solar:users-group-rounded-bold-duotone" className="text-red-500 text-3xl" />
                                </div>
                                <h4 className="text-xl font-semibold mb-2 leading-tight text-gray-900 dark:text-white">
                                    <span className="text-red-500">500+</span> Happy Clients
                                </h4>
                                <p className="text-gray-600 dark:text-gray-400">Loved and trusted by individuals and businesses alike.</p>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Minimal Footer */}
                <footer className="bg-black text-white pt-20 pb-8 px-4 relative z-10">
                    <div className="md:px-16 px-3 mx-auto grid md:grid-cols-4 gap-10 border-b border-gray-700 pb-10">
                        <div>
                            <h3 className="text-2xl font-bold mb-4 text-white cursor-default">
                                PrintAir <span className="text-red-500 mt-5">Advertising</span>
                            </h3>
                            <p className="text-gray-400 text-sm">
                                We deliver creative, high-quality printing and advertising solutions to businesses and individuals across Sri Lanka.
                            </p>
                            <div className="mt-6">
                                <p className="flex items-center gap-2 text-gray-400 text-sm">
                                    <Icon icon="solar:map-point-bold-duotone" className="text-lg text-red-500" />
                                    No. 67/D/1, Uggashena, Walpola, Ragama, Sri Lanka
                                </p>
                                <p className="flex items-center gap-2 text-gray-400 text-sm mt-2">
                                    <Icon icon="solar:phone-bold-duotone" className="text-lg text-red-500" />
                                    +94 76 886 0175 | (011) 224 1858
                                </p>
                                <p className="flex items-center gap-2 text-gray-400 text-sm mt-2">
                                    <Icon icon="solar:letter-bold-duotone" className="text-lg text-red-500" />
                                    contact@printair.lk
                                </p>
                            </div>
                        </div>

                        <div className="md:text-left text-center">
                            <h4 className="text-lg font-semibold mb-3 text-white">Quick Links</h4>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li><Link href="/" className="hover:text-white">Home</Link></li>
                                <li><Link href="/products" className="hover:text-white">Products</Link></li>
                                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                            </ul>
                        </div>

                        <div className="md:text-left text-center">
                            <h4 className="text-lg font-semibold mb-3 text-white">Popular Products</h4>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li>Business Cards</li>
                                <li>Banners & Flags</li>
                                <li>Brochures</li>
                                <li>Custom Stickers</li>
                            </ul>
                        </div>

                        <div className="md:text-left text-center">
                            <h4 className="text-lg font-semibold mb-3 text-white">Design Services</h4>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li>Logo Design</li>
                                <li>Branding</li>
                                <li>Packaging Design</li>
                                <li>3D Visualization</li>
                                <li>Social Media Designs</li>
                            </ul>
                        </div>
                    </div>

                    <div className="text-center text-xs text-gray-500 mt-8">
                        <p>© {new Date().getFullYear()} PrintAir Advertising. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
