import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Error500() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-red-900 flex items-center justify-center p-4 overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Main content */}
            <div className={`relative z-10 max-w-4xl w-full transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12 lg:p-16">
                    {/* Server error icon */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-50 animate-pulse"></div>
                            <div className="relative bg-gradient-to-br from-orange-500 to-red-600 rounded-full p-6 shadow-2xl animate-shake">
                                <svg 
                                    className="w-16 h-16 md:w-20 md:h-20 text-white" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Error code */}
                    <div className="text-center mb-6">
                        <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-500 animate-gradient-x mb-4">
                            500
                        </h1>
                        <div className="h-1 w-32 mx-auto bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 rounded-full mb-6"></div>
                    </div>

                    {/* Error message */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Internal Server Error
                        </h2>
                        <p className="text-lg md:text-xl text-gray-300 mb-2">
                            Something went wrong on our end
                        </p>
                        <p className="text-base text-gray-400">
                            Don't worry, our team has been notified and is working on it
                        </p>
                    </div>

                    {/* Status indicators */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
                            <div className="flex items-center space-x-3">
                                <div className="bg-red-500/20 rounded-lg p-2">
                                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold text-sm">Server Issue</h3>
                                    <p className="text-gray-400 text-xs">Technical problem</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
                            <div className="flex items-center space-x-3">
                                <div className="bg-yellow-500/20 rounded-lg p-2">
                                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold text-sm">Team Notified</h3>
                                    <p className="text-gray-400 text-xs">Auto-reported</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-500/20 rounded-lg p-2">
                                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold text-sm">Try Again</h3>
                                    <p className="text-gray-400 text-xs">Refresh page</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* What you can do section */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
                        <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            What you can do:
                        </h3>
                        <ul className="space-y-2 text-gray-300">
                            <li className="flex items-start">
                                <span className="text-orange-400 mr-2">•</span>
                                <span>Try refreshing the page</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-orange-400 mr-2">•</span>
                                <span>Go back to the previous page</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-orange-400 mr-2">•</span>
                                <span>Return to the dashboard and try again</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-orange-400 mr-2">•</span>
                                <span>If the problem persists, contact our support team</span>
                            </li>
                        </ul>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={() => window.location.reload()}
                            className="group relative px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center space-x-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>Refresh Page</span>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>

                        <Link
                            href={route('dashboard')}
                            className="group px-8 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span>Go to Dashboard</span>
                        </Link>
                    </div>

                    {/* Help text */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-400 text-sm">
                            Need immediate assistance?{' '}
                            <Link 
                                href="/support" 
                                className="text-orange-400 hover:text-orange-300 underline transition-colors"
                            >
                                Contact our support team
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer info */}
                <div className="mt-6 text-center">
                    <p className="text-gray-500 text-sm">
                        Error Code: <span className="font-mono text-gray-400">500_INTERNAL_SERVER_ERROR</span>
                    </p>
                    <p className="text-gray-600 text-xs mt-1">
                        Reference ID: <span className="font-mono">{Date.now()}</span>
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes blob {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    25% {
                        transform: translate(20px, -50px) scale(1.1);
                    }
                    50% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                    75% {
                        transform: translate(50px, 50px) scale(1.05);
                    }
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

                @keyframes gradient-x {
                    0%, 100% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                }

                .animate-gradient-x {
                    background-size: 200% 200%;
                    animation: gradient-x 3s ease infinite;
                }

                @keyframes shake {
                    0%, 100% {
                        transform: rotate(-1deg);
                    }
                    50% {
                        transform: rotate(1deg);
                    }
                }

                .animate-shake {
                    animation: shake 0.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
