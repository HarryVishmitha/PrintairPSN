// resources/js/Components/ApplicationLogo.jsx
import { Link } from "@inertiajs/react";

function LogoImage({ compact = false }) {
    return (
        <span className="relative inline-flex">
            <span className="block dark:hidden">
                <img
                    src={compact ? "/assets/logo-icon.png" : "/assets/logo.png"}
                    alt="Printair"
                    className={compact ? "h-8 w-8" : "h-8 w-auto"}
                    loading="lazy"
                    width={compact ? 32 : undefined}
                    height={32}
                />
            </span>
            <span className="hidden dark:block">
                <img
                    src={compact ? "/assets/logo-icon.png" : "/assets/logo.png"}
                    alt="Printair"
                    className={compact ? "h-8 w-8" : "h-8 w-auto"}
                    loading="lazy"
                    width={compact ? 32 : undefined}
                    height={32}
                />
            </span>
        </span>
    );
}

export default function ApplicationLogo({
    className = "",
    compact = false,
    href = "/",
    withLink = true, // 👈 opt-out when already wrapped in a <Link>
    onClick, // allow parent handlers
}) {
    const logClick = (e) => {
        // basic activity log hook (replace with your logger/endpoint)
        // fetch('/api/activity', { method: 'POST', body: JSON.stringify({ type: 'logo_click', ts: Date.now() }) });
        console.debug("[activity] logo_click", { ts: Date.now() });
        onClick?.(e);
    };

    const content = <LogoImage compact={compact} />;

    if (!withLink) {
        return (
            <span className={`inline-flex items-center ${className}`}>
                {content}
            </span>
        );
    }

    return (
        <Link
            href={href}
            aria-label="Go to dashboard"
            className={`inline-flex items-center ${className}`}
            onClick={logClick}
        >
            {content}
        </Link>
    );
}
