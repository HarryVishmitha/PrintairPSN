import { Link, usePage } from '@inertiajs/react';
import { Icon } from '@iconify/react';

export default function Breadcrumbs({ items }) {
    const { url } = usePage();
    
    // Auto-generate breadcrumbs if not provided
    const breadcrumbs = items || generateBreadcrumbs(url);

    return (
        <nav className="flex items-center space-x-1 text-xs" aria-label="Breadcrumb">
            {breadcrumbs.map((item, index) => (
                <div key={index} className="flex items-center">
                    {index > 0 && (
                        <Icon 
                            icon="solar:alt-arrow-right-linear" 
                            className="w-3 h-3 mx-1.5 text-gray-400 dark:text-gray-600"
                        />
                    )}
                    {item.href && index !== breadcrumbs.length - 1 ? (
                        <Link
                            href={item.href}
                            className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            {item.icon && (
                                <Icon 
                                    icon={item.icon} 
                                    className="w-3.5 h-3.5"
                                />
                            )}
                            <span>{item.label}</span>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-medium px-2 py-1">
                            {item.icon && (
                                <Icon 
                                    icon={item.icon} 
                                    className="w-3.5 h-3.5"
                                />
                            )}
                            <span>{item.label}</span>
                        </div>
                    )}
                </div>
            ))}
        </nav>
    );
}

function generateBreadcrumbs(url) {
    const paths = url.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Home', href: '/' }];
    
    let currentPath = '';
    paths.forEach((path, index) => {
        currentPath += `/${path}`;
        const label = path
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        
        breadcrumbs.push({
            label,
            href: index === paths.length - 1 ? null : currentPath,
        });
    });
    
    return breadcrumbs;
}
