import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { router } from '@inertiajs/react';

export default function QuickSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    const searchItems = [
        { title: 'Dashboard', url: '/admin', icon: 'solar:home-2-bold-duotone', category: 'Pages' },
        { title: 'Working Groups', url: '/admin/working-groups', icon: 'solar:users-group-rounded-bold-duotone', category: 'Pages' },
        { title: 'Users', url: '/admin/users', icon: 'solar:user-bold-duotone', category: 'Pages' },
        { title: 'Activity Log', url: '/admin/activity-log', icon: 'solar:document-text-bold-duotone', category: 'Pages' },
        { title: 'Settings', url: '/admin/settings', icon: 'solar:settings-bold-duotone', category: 'Pages' },
    ];

    const handleSearch = (value) => {
        setQuery(value);
        if (value.trim()) {
            const filtered = searchItems.filter(item =>
                item.title.toLowerCase().includes(value.toLowerCase()) ||
                item.category.toLowerCase().includes(value.toLowerCase())
            );
            setResults(filtered);
        } else {
            setResults([]);
        }
    };

    const handleSelect = (url) => {
        router.visit(url);
        setIsOpen(false);
        setQuery('');
        setResults([]);
    };

    return (
        <div className="relative w-full">
            <Button
                variant="ghost"
                className="w-full justify-start text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Icon icon="solar:magnifer-linear" className="w-4 h-4 mr-2" />
                <span className="text-sm">Quick search...</span>
                <kbd className="ml-auto hidden lg:inline-flex h-5 items-center gap-1 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 px-1.5 font-mono text-xs text-gray-600 dark:text-gray-400">
                    Ctrl K
                </kbd>
            </Button>

            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/20 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-in slide-in-from-top-2">
                        <div className="p-3">
                            <div className="relative">
                                <Icon 
                                    icon="solar:magnifer-linear" 
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                                />
                                <Input
                                    type="text"
                                    placeholder="Search pages, users, settings..."
                                    value={query}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-10"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {results.length > 0 && (
                            <div className="max-h-80 overflow-y-auto border-t border-gray-200 dark:border-gray-700">
                                {results.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSelect(item.url)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                    >
                                        <Icon icon={item.icon} className="w-5 h-5 text-primary" />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {item.title}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {item.category}
                                            </div>
                                        </div>
                                        <Icon 
                                            icon="solar:alt-arrow-right-linear" 
                                            className="w-4 h-4 text-gray-400"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {query && results.length === 0 && (
                            <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                No results found for "{query}"
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
