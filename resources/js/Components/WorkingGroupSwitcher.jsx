import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';

export default function WorkingGroupSwitcher() {
    const { auth, currentWorkingGroup, availableWorkingGroups } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredGroups, setFilteredGroups] = useState(availableWorkingGroups || []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredGroups(availableWorkingGroups || []);
        } else {
            const filtered = (availableWorkingGroups || []).filter((group) =>
                group.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredGroups(filtered);
        }
    }, [searchQuery, availableWorkingGroups]);

    const handleSwitch = (groupId) => {
        router.post(`/working-groups/${groupId}/switch`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setIsOpen(false);
                setSearchQuery('');
            },
        });
    };

    const handleSetDefault = (groupId, e) => {
        e.stopPropagation();
        router.post(`/working-groups/${groupId}/set-default`, {}, {
            preserveScroll: true,
        });
    };

    if (!currentWorkingGroup) {
        return null;
    }

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {currentWorkingGroup.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {currentWorkingGroup.type}
                    </div>
                </div>
                <svg 
                    className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Dropdown Panel */}
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                Switch Working Group
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Select a working group to switch context
                            </p>
                        </div>

                        {/* Search Input */}
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="relative">
                                <svg 
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search groups..."
                                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Working Groups List */}
                        <div className="max-h-64 overflow-y-auto">
                            {filteredGroups.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No working groups found
                                </div>
                            ) : (
                                filteredGroups.map((group) => {
                                    const isActive = currentWorkingGroup.id === group.id;
                                    const isDefault = group.is_default;
                                    
                                    return (
                                        <button
                                            key={group.id}
                                            onClick={() => handleSwitch(group.id)}
                                            disabled={isActive}
                                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                                                isActive ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`text-sm font-medium ${
                                                            isActive 
                                                                ? 'text-blue-600 dark:text-blue-400' 
                                                                : 'text-gray-900 dark:text-white'
                                                        }`}>
                                                            {group.name}
                                                        </span>
                                                        {isActive && (
                                                            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                        {isDefault && (
                                                            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {group.type}
                                                        </span>
                                                        <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {group.role}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {!isDefault && !isActive && (
                                                    <button
                                                        onClick={(e) => handleSetDefault(group.id, e)}
                                                        className="ml-2 p-1.5 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded transition-colors"
                                                        title="Set as default"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
