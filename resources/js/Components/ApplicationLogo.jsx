export default function ApplicationLogo(props) {
    return (
        <a href="/" className={`inline-flex items-center ${props.className || ''}`}>
            <span className="relative inline-flex">
                <span className="block dark:hidden">
                    <img
                        src={props.compact ? '/assets/logo-icon.png' : '/assets/logo.png'}
                        alt="Application Logo"
                        className={props.compact ? 'h-8 w-8' : 'h-8 w-auto'}
                        loading="lazy"
                    />
                </span>
                <span className="hidden dark:block">
                    <img
                        src={props.compact ? '/assets/logo-icon.png' : '/assets/logo.png'}
                        alt="Application Logo"
                        className={props.compact ? 'h-8 w-8' : 'h-8 w-auto'}
                        loading="lazy"
                    />
                </span>
            </span>
        </a>
    );
}
