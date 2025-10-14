import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
    useId,
} from 'react';

/**
 * Advanced TextInput
 * Props:
 *  label, description, helper, error, success, icon, rightIcon, loading, size = sm|md|lg,
 *  variant = outline|soft|underline, radius, fullWidth, isFocused, disabled, className
 */
const sizes = {
    sm: 'text-sm py-2 ps-9 pe-3',
    md: 'text-sm py-2.5 ps-10 pe-3',
    lg: 'text-base py-3 ps-11 pe-4',
};

const radiusMap = {
    none: 'rounded-none',
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
};

const variantMap = {
    outline:
        'border bg-white/70 dark:bg-neutral-900/70 backdrop-blur border-gray-300 dark:border-neutral-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-400/30',
    soft:
        'border border-transparent bg-gray-100/70 dark:bg-neutral-800/70 hover:bg-gray-100 dark:hover:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-900 focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-400/30',
    underline:
        'border-0 border-b border-gray-300 dark:border-neutral-600 rounded-none focus:border-indigo-500 dark:focus:border-indigo-400 px-0 ps-8 pe-2 focus:ring-0 bg-transparent',
};

function cx(...c) {
    return c.filter(Boolean).join(' ');
}

export default forwardRef(function TextInput(
    {
        type = 'text',
        label,
        description,
        helper,
        error,
        success,
        icon,
        rightIcon,
        loading = false,
        size = 'md',
        variant = 'outline',
        radius = 'md',
        fullWidth = true,
        isFocused = false,
        disabled = false,
        className = '',
        inputClassName = '',
        id,
        ...props
    },
    ref
) {
    const localRef = useRef(null);
    const reactId = useId();
    const inputId = id || reactId;
    const [hasFocus, setHasFocus] = useState(false);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
        blur: () => localRef.current?.blur(),
        select: () => localRef.current?.select(),
        value: () => localRef.current?.value,
    }));

    useEffect(() => {
        if (isFocused) localRef.current?.focus();
    }, [isFocused]);

    const stateColor = error
        ? 'ring-red-500/30 border-red-500 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/40 dark:focus:ring-red-400/40'
        : success
        ? 'ring-emerald-500/30 border-emerald-500 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-500/40 dark:focus:ring-emerald-400/40'
        : '';

    const textColor = disabled
        ? 'text-gray-400 dark:text-neutral-500'
        : 'text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-neutral-500';

    const base =
        'w-full outline-none transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-60 selection:bg-indigo-500/30 dark:selection:bg-indigo-400/30';

    const wrapperClasses = cx(
        'group relative',
        fullWidth && 'w-full',
        variant !== 'underline' && radiusMap[radius],
        'focus-within:scale-[1.002]',
        'transition-all'
    );

    const inputClasses = cx(
        base,
        sizes[size],
        variantMap[variant],
        textColor,
        stateColor,
        hasFocus && !error && !success && 'shadow-sm',
        'pr-10',
        inputClassName
    );

    return (
        <div className={cx('flex flex-col gap-1', fullWidth && 'w-full', className)}>
            {label && (
                <label
                    htmlFor={inputId}
                    className={cx(
                        'text-sm font-medium tracking-wide flex items-center gap-1',
                        disabled
                            ? 'text-gray-400 dark:text-neutral-500'
                            : 'text-gray-700 dark:text-gray-200'
                    )}
                >
                    {label}
                    {props.required && (
                        <span className="text-red-500 dark:text-red-400 font-normal">*</span>
                    )}
                </label>
            )}

            {description && (
                <p className="text-xs text-gray-500 dark:text-neutral-400">{description}</p>
            )}

            <div className={wrapperClasses}>
                {icon && (
                    <span
                        className={cx(
                            'absolute inset-y-0 left-0 flex items-center justify-center',
                            sizes[size].includes('py-3') ? 'w-11' : 'w-10',
                            'text-gray-400 dark:text-neutral-500 pointer-events-none'
                        )}
                    >
                        {icon}
                    </span>
                )}

                <input
                    id={inputId}
                    ref={localRef}
                    type={type}
                    disabled={disabled}
                        aria-invalid={!!error}
                        aria-describedby={
                            error
                                ? `${inputId}-error`
                                : helper
                                ? `${inputId}-helper`
                                : undefined
                        }
                    className={cx(
                        inputClasses,
                        !icon && 'ps-3',
                        !rightIcon && !loading && 'pe-3'
                    )}
                    onFocus={(e) => {
                        setHasFocus(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setHasFocus(false);
                        props.onBlur?.(e);
                    }}
                    {...props}
                />

                {(rightIcon || loading || success || error) && (
                    <span
                        className={cx(
                            'absolute inset-y-0 right-0 flex items-center justify-center',
                            sizes[size].includes('py-3') ? 'w-10' : 'w-9',
                            'pr-2'
                        )}
                    >
                        {loading && (
                            <svg
                                className="animate-spin h-4 w-4 text-indigo-500 dark:text-indigo-400"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <path
                                    className="opacity-90"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                />
                            </svg>
                        )}
                        {!loading && error && (
                            <svg
                                className="h-4 w-4 text-red-500 dark:text-red-400"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v4m0 4h.01M4.93 19.07a10 10 0 1114.14 0A10 10 0 014.93 19.07z"
                                />
                            </svg>
                        )}
                        {!loading && success && !error && (
                            <svg
                                className="h-4 w-4 text-emerald-500 dark:text-emerald-400"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        )}
                        {!loading && !error && !success && rightIcon}
                    </span>
                )}

                {/* subtle gradient / focus ring accent */}
                <span
                    className={cx(
                        'pointer-events-none absolute inset-0 rounded-inherit',
                        variant !== 'underline' && radiusMap[radius],
                        'before:absolute before:inset-0 before:rounded-inherit before:opacity-0 before:bg-gradient-to-r before:from-indigo-500/20 before:to-fuchsia-500/20 before:transition-opacity',
                        'group-focus-within:before:opacity-100'
                    )}
                />
            </div>

            {error ? (
                <p
                    id={`${inputId}-error`}
                    className="text-xs font-medium text-red-600 dark:text-red-400 mt-0.5"
                >
                    {error}
                </p>
            ) : helper ? (
                <p
                    id={`${inputId}-helper`}
                    className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5"
                >
                    {helper}
                </p>
            ) : null}
        </div>
    );
});
