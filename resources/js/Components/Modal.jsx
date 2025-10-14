import { Fragment, useEffect } from "react";
import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function Modal({
    children,
    show = false,
    maxWidth = "2xl",
    closeable = true,
    onClose = () => {},
    title = null,
    hideCloseButton = false,
    backdropBlur = true,
    centered = true,
    showCloseIcon = true,
    closeOnEsc = true,
    padding = true,
}) {
    const close = () => {
        if (closeable) {
            onClose();
        }
    };

    useEffect(() => {
        if (!closeOnEsc) return;

        const handleEscKey = (e) => {
            if (e.key === "Escape" && closeable && show) {
                close();
            }
        };

        document.addEventListener("keydown", handleEscKey);

        return () => {
            document.removeEventListener("keydown", handleEscKey);
        };
    }, [show, closeable]);

    // Add scroll lock when modal is open
    useEffect(() => {
        if (show) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [show]);

    const maxWidthClass = {
        sm: "sm:max-w-sm",
        md: "sm:max-w-md",
        lg: "sm:max-w-lg",
        xl: "sm:max-w-xl",
        "2xl": "sm:max-w-2xl",
        "3xl": "sm:max-w-3xl",
        "4xl": "sm:max-w-4xl",
        "5xl": "sm:max-w-5xl",
        full: "sm:max-w-full",
    }[maxWidth];

    return (
        <Transition show={show} as={Fragment} appear>
            <Dialog
                as="div"
                id="modal"
                className="fixed inset-0 z-50 overflow-y-auto"
                onClose={close}
            >
                <div
                    className={`min-h-screen px-4 ${
                        centered ? "flex items-center justify-center" : "pt-16"
                    } text-center sm:block sm:p-0`}
                >
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Dialog.Overlay
                            className={`fixed inset-0 transition-opacity ${
                                backdropBlur ? "backdrop-blur-sm" : ""
                            } bg-gray-700/75`}
                        />
                    </TransitionChild>

                    {/* This element is to trick the browser into centering the modal contents. */}
                    {centered && (
                        <span
                            className="inline-block h-screen align-middle"
                            aria-hidden="true"
                        >
                            &#8203;
                        </span>
                    )}

                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enterTo="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        <DialogPanel
                            className={`inline-block w-full transform overflow-hidden rounded-lg bg-white shadow-xl transition-all ${maxWidthClass} ${
                                centered ? "align-middle" : ""
                            }`}
                        >
                            {title && (
                                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium text-gray-900"
                                    >
                                        {title}
                                    </Dialog.Title>
                                    {showCloseIcon &&
                                        closeable &&
                                        !hideCloseButton && (
                                            <button
                                                type="button"
                                                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                onClick={close}
                                            >
                                                <span className="sr-only">
                                                    Close
                                                </span>
                                                <XMarkIcon
                                                    className="h-6 w-6"
                                                    aria-hidden="true"
                                                />
                                            </button>
                                        )}
                                </div>
                            )}
                            <div className={padding ? "p-6" : ""}>
                                {!title &&
                                    showCloseIcon &&
                                    closeable &&
                                    !hideCloseButton && (
                                        <div className="absolute top-4 right-4">
                                            <button
                                                type="button"
                                                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                onClick={close}
                                            >
                                                <span className="sr-only">
                                                    Close
                                                </span>
                                                <XMarkIcon
                                                    className="h-6 w-6"
                                                    aria-hidden="true"
                                                />
                                            </button>
                                        </div>
                                    )}
                                {children}
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    );
}
