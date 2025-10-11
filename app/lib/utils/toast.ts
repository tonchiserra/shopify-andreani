declare global {
    interface Window {
        shopify?: {
            toast?: {
                show: (message: string, options?: { duration?: number; isError?: boolean }) => string;
                hide: (id: string) => void;
            }
        }
    }
}

export const showToast = (message: string, options?: { duration?: number; isError?: boolean }) => {
    window.shopify?.toast?.show(message, options)
}