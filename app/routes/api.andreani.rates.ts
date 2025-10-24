import type { LoaderFunctionArgs } from "react-router"
import { type ShopifyShippingRateRequest, type ShopifyShippingRateResponse, type AndreaniShippingRateRequest, type AndreaniShippingRateResponse, andreaniService } from "app/lib/services"

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const body = JSON.parse(`${request.body}`) as ShopifyShippingRateRequest
    console.log("Body:", body)

    const payload: AndreaniShippingRateRequest = {
        cpDestino: body.rate.destination.postal_code,
        contrato: "YOUR_CONTRACT_HERE", // Cómo se qué contrto va?
        cliente: "YOUR_CLIENT_HERE",   // Sería el CLIENT ID?
        sucursalOrigen: "YOUR_SUCURSAL_HERE", // Opcional - Qué sucursal? Sería el remitente? Cómo se cuál va?
        bultos: [
            {
                volumen: `${body.rate.items.reduce((acc, item) => acc + item.grams, 0)}`
            }
        ]
    }
    console.log("Andreani Payload:", payload)

    const response: AndreaniShippingRateResponse = await andreaniService.getShippingRates(payload)
    console.log("Andreani Response:", response)

    const shopifyResponse: ShopifyShippingRateResponse = {
        rates: [
            {
                service_name: "", // ??
                service_code: "", // ??
                total_price: response.tarifaConIva ? `${(Number(response.tarifaConIva.total) * 100)}` : "0",
                description: "", // ??
                currency: body.rate.currency
            }
        ]
    }

    return Response.json(shopifyResponse)
}