// resources/js/components/ui/alert-dialog.jsx
import * as React from "react";
import * as RadixAlertDialog from "@radix-ui/react-alert-dialog";

export const AlertDialog = RadixAlertDialog.Root;
export const AlertDialogTrigger = RadixAlertDialog.Trigger;
export const AlertDialogPortal = RadixAlertDialog.Portal;

export const AlertDialogOverlay = React.forwardRef(function AlertDialogOverlay(
    props,
    ref
) {
    return (
        <RadixAlertDialog.Overlay
            ref={ref}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out"
            {...props}
        />
    );
});

export const AlertDialogContent = React.forwardRef(function AlertDialogContent(
    { className = "", ...props },
    ref
) {
    return (
        <AlertDialogPortal>
            <AlertDialogOverlay />
            <RadixAlertDialog.Content
                ref={ref}
                className={
                    "fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5 dark:bg-neutral-900 " +
                    className
                }
                {...props}
            />
        </AlertDialogPortal>
    );
});

export const AlertDialogHeader = ({ className = "", ...props }) => (
    <div className={"mb-4 space-y-1 " + className} {...props} />
);
export const AlertDialogFooter = ({ className = "", ...props }) => (
    <div className={"mt-6 flex justify-end gap-2 " + className} {...props} />
);

export const AlertDialogTitle = React.forwardRef(function AlertDialogTitle(
    { className = "", ...props },
    ref
) {
    return (
        <RadixAlertDialog.Title
            ref={ref}
            className={
                "text-lg font-semibold leading-none tracking-tight " + className
            }
            {...props}
        />
    );
});

export const AlertDialogDescription = React.forwardRef(
    function AlertDialogDescription({ className = "", ...props }, ref) {
        return (
            <RadixAlertDialog.Description
                ref={ref}
                className={
                    "text-sm text-neutral-600 dark:text-neutral-300 " +
                    className
                }
                {...props}
            />
        );
    }
);

export const AlertDialogAction = React.forwardRef(function AlertDialogAction(
    { className = "", ...props },
    ref
) {
    return (
        <RadixAlertDialog.Action
            ref={ref}
            className={
                "inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium ring-1 ring-black/10 shadow-sm hover:shadow transition " +
                "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 " +
                className
            }
            {...props}
        />
    );
});

export const AlertDialogCancel = React.forwardRef(function AlertDialogCancel(
    { className = "", ...props },
    ref
) {
    return (
        <RadixAlertDialog.Cancel
            ref={ref}
            className={
                "inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium ring-1 ring-black/10 shadow-sm hover:shadow transition " +
                "bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white " +
                className
            }
            {...props}
        />
    );
});
