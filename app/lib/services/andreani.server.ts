import { configService } from "./index"
import qs from "qs"

type ShopifyDestination = {
    country:        string
    postal_code:    string
    province:       string
    city:           string
    name:           string | null
    address1:       string
    address2:       string | null
    address3:       string | null
    phone:          string | null
    fax:            string | null
    email:          string | null
    address_type:   string | null
    company_name:   string | null
}

export type ShopifyShippingRateRequest = {
    rate: {
        origin: ShopifyDestination
        destination: ShopifyDestination
        items: Array<{
            name: string
            sku: string | null
            quantity: number
            grams: number
            price: number
            vendor: string | null
            requires_shipping: boolean
            taxable: boolean
            fulfillment_service: string
            properties: Array<{
                key: string
                value: string | null
            }> | null
            product_id: number
            variant_id: number
        }>
        order_totals: {
            subtotal_price: number
            total_price: number
            discount_amount: number
        },
        currency: string
        locale: string
    }
}

export type ShopifyShippingRate = {
    service_name:       string
    service_code:       string
    total_price:        string | number
    description:        string
    currency:           string
    min_delivery_date?:  string
    max_delivery_date?:  string   
}

export type ShopifyShippingRateResponse = {
    rates: Array<ShopifyShippingRate>
}

export type AndreaniShippingRateRequest = {
    cpDestino: string
    contrato: string
    cliente: string
    sucursalOrigen?: string
    bultos: Array<{
        volumen: string
        valorDeclarado?: string
        kilos?: string
        altoCm?: string
        largoCm?: string
        anchoCm?: string
    }>

}

export type AndreaniShippingRateResponse = {
    pesoAforado?: string
    tarifaSinIva?: {
        seguroDistribucion: string
        distribucion: string
        total: string
    }
    tarifaConIva?: {
        seguroDistribucion: string
        distribucion: string
        total: string
    }
}

export type AndreaniShippingRateResponseError = {
    type: string
    title: string
    detail: string
    status: number
    errors?: string[]
}

export const andreaniService = {
    async getShippingRates(payload: AndreaniShippingRateRequest): Promise<AndreaniShippingRateResponse> {
        let RESULT: AndreaniShippingRateResponse = {}
        
        try {
            const activeApiUrl = await configService.getActiveApiUrl()
            if(!activeApiUrl) throw new Error("No active Andreani API URL configured")

            const queryString = qs.stringify(payload, { arrayFormat: 'indices' })
            
            const response = await fetch(`${activeApiUrl}/v1/tarifas?${queryString}`)
            
            if(!response.ok) {
                const error = await response.json() as AndreaniShippingRateResponseError
                throw new Error(`${error.detail || 'Error fetching Andreani rates'}`)
            }
                
            RESULT = await response.json()
            return RESULT

        }catch(error) {
            console.error("Error fetching Andreani rates:", error)
        }
        
        return RESULT
    }
}