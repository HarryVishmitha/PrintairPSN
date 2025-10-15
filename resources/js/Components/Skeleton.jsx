export default function Skeleton({ className = '', variant = 'default' }) {
    const variants = {
        default: 'h-4',
        text: 'h-4',
        title: 'h-8',
        avatar: 'h-12 w-12 rounded-full',
        button: 'h-10 w-24',
        card: 'h-32 w-full',
    };

    return (
        <div
            className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${variants[variant]} ${className}`}
        />
    );
}
