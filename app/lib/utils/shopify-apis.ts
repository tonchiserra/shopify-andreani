declare global {
    interface Window {
        shopify?: {
            toast?: {
                show: (message: string, options?: { duration?: number; isError?: boolean }) => string;
                hide: (id: string) => void;
            },
            modal?: {
                hide: (id: string) => Promise<void>;
                show: (id: string) => Promise<void>;
                toggle: (id: string) => Promise<void>;
            }
        }
    }
}

export const showToast = (message: string, options?: { duration?: number; isError?: boolean }) => {
    window.shopify?.toast?.show(message, options)
}

export const hideToast = (id: string) => {
    window.shopify?.toast?.hide(id)
}

export const showModal = async (id: string) => {
    await window.shopify?.modal?.show(id)
}

export const hideModal = async (id: string) => {
    await window.shopify?.modal?.hide(id)
}

export const toggleModal = async (id: string) => {
    await window.shopify?.modal?.toggle(id)
}