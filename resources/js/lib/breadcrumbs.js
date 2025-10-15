/**
 * Breadcrumb Helper Utilities
 * 
 * These functions help generate consistent breadcrumbs across the application.
 */

/**
 * Common breadcrumb configurations
 */
export const commonBreadcrumbs = {
    home: { label: 'Home', href: '/', icon: 'solar:home-2-linear' },
    admin: { label: 'Admin', href: '/admin', icon: 'solar:shield-user-linear' },
    manager: { label: 'Manager', href: '/manager', icon: 'solar:user-id-linear' },
    designer: { label: 'Designer', href: '/designer', icon: 'solar:palette-linear' },
    marketing: { label: 'Marketing', href: '/marketing', icon: 'solar:chart-linear' },
    member: { label: 'Member', href: '/member', icon: 'solar:user-linear' },
};

/**
 * Generate breadcrumbs for admin pages
 * 
 * @param {string} currentPage - The current page name
 * @param {string} icon - Optional icon for current page
 * @returns {Array} Breadcrumb items
 */
export function adminBreadcrumbs(currentPage, icon = null) {
    return [
        commonBreadcrumbs.home,
        commonBreadcrumbs.admin,
        { label: currentPage, icon }
    ];
}

/**
 * Generate breadcrumbs for admin sub-pages
 * 
 * @param {string} section - The section name (e.g., 'Working Groups')
 * @param {string} sectionHref - The section href
 * @param {string} currentPage - The current page name
 * @param {object} options - Optional configuration
 * @returns {Array} Breadcrumb items
 */
export function adminSubBreadcrumbs(section, sectionHref, currentPage, options = {}) {
    const breadcrumbs = [
        commonBreadcrumbs.home,
        commonBreadcrumbs.admin,
        { 
            label: section, 
            href: sectionHref,
            icon: options.sectionIcon
        },
        { 
            label: currentPage,
            icon: options.currentIcon
        }
    ];
    
    return breadcrumbs;
}

/**
 * Generate breadcrumbs from URL path
 * 
 * @param {string} pathname - The URL pathname
 * @param {object} customLabels - Custom labels for path segments
 * @returns {Array} Breadcrumb items
 */
export function generateFromPath(pathname, customLabels = {}) {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = [commonBreadcrumbs.home];
    
    let currentPath = '';
    paths.forEach((path, index) => {
        currentPath += `/${path}`;
        
        // Check if there's a custom label
        const label = customLabels[path] || path
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        
        breadcrumbs.push({
            label,
            href: index === paths.length - 1 ? null : currentPath, // Last item has no href
        });
    });
    
    return breadcrumbs;
}

/**
 * Common page configurations
 */
export const pageBreadcrumbs = {
    // Admin pages
    adminDashboard: () => adminBreadcrumbs('Dashboard', 'solar:widget-bold-duotone'),
    adminUsers: () => adminBreadcrumbs('Users', 'solar:user-bold-duotone'),
    adminWorkingGroups: () => adminBreadcrumbs('Working Groups', 'solar:users-group-rounded-bold-duotone'),
    adminActivityLog: () => adminBreadcrumbs('Activity Log', 'solar:history-bold-duotone'),
    adminSettings: () => adminBreadcrumbs('Settings', 'solar:settings-bold-duotone'),
    
    // Admin sub-pages
    adminUserCreate: () => adminSubBreadcrumbs(
        'Users', 
        '/admin/users', 
        'Create User',
        { 
            sectionIcon: 'solar:user-bold-duotone',
            currentIcon: 'solar:user-plus-bold-duotone'
        }
    ),
    
    adminWorkingGroupCreate: () => adminSubBreadcrumbs(
        'Working Groups',
        '/admin/working-groups',
        'Create Working Group',
        {
            sectionIcon: 'solar:users-group-rounded-bold-duotone',
            currentIcon: 'solar:add-circle-bold-duotone'
        }
    ),
};

/**
 * Example usage in components:
 * 
 * import { pageBreadcrumbs } from '@/lib/breadcrumbs';
 * 
 * // In your component:
 * const breadcrumbs = pageBreadcrumbs.adminDashboard();
 * 
 * // Or for custom breadcrumbs:
 * import { adminBreadcrumbs } from '@/lib/breadcrumbs';
 * const breadcrumbs = adminBreadcrumbs('My Custom Page', 'solar:document-linear');
 */
