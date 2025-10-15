import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';

export function useFlashMessages() {
    const { props } = usePage();
    const { flash } = props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }

        if (flash?.error) {
            toast.error(flash.error);
        }

        if (flash?.info) {
            toast(flash.info, {
                icon: 'ℹ️',
            });
        }

        if (flash?.warning) {
            toast(flash.warning, {
                icon: '⚠️',
                style: {
                    background: '#F59E0B',
                    color: '#fff',
                },
            });
        }
    }, [flash]);
}

export default useFlashMessages;
