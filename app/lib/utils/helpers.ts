export const makeShopifyCarrierServiceId = (id: string): string => {
    return `gid://shopify/DeliveryCarrierService/${id}`
}

export const parseCarrierServiceId = (shopifyId: string): string => {
    return shopifyId.replace('gid://shopify/DeliveryCarrierService/', '').replace('/', '')
}