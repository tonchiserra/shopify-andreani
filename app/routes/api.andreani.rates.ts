import type { LoaderFunctionArgs } from "react-router"
import { type ShopifyShippingRateRequest, type ShopifyShippingRateResponse, type AndreaniShippingRateRequest, type AndreaniShippingRateResponse, andreaniService, dealService, configService } from "app/lib/services/index"

export const action = async ({ request }: LoaderFunctionArgs) => {
    const shopifyResponse: ShopifyShippingRateResponse = {
        rates: []
    }

    // Shopify no me está mandando la info
    console.log("===============")
    console.log("===============")
    console.log("===============")
    console.log("===============")
    console.log("Request:", request)
    console.log("===============")
    console.log("===============")
    console.log("===============")
    console.log("===============")
    const body = JSON.parse(`${request.body}`) as ShopifyShippingRateRequest
    
    const deals = await dealService.getAll()
    if(deals.length === 0) return Response.json(shopifyResponse)

    const clientId = await configService.getClientId()
    if(!clientId) return Response.json(shopifyResponse)

    for(let i=0; i<deals.length; i++) {
        const deal = deals[i]
        if(!deal.senders || deal.senders?.length === 0) continue

        // Es necesario iterar por cada sender del deal si no le paso la sucursal de origen? 
        // Estaría mandando n veces el mismo request si hay varios senders
        for(let j=0; j<deal.senders.length; j++) {
            const dealSender = deal.senders[j]

            if(!dealSender.sender.active) continue

            if(deal.freeShipping) {
                shopifyResponse.rates.push({
                    service_name: deal.name || "Andreani Service",
                    service_code: `${dealSender.id}`,
                    total_price: "0",
                    description: "",
                    currency: body.rate.currency
                })

                continue
            }

            const payload: AndreaniShippingRateRequest = {
                cpDestino: deal.toLocation ? (dealSender.sender.locationZip ?? '') : body.rate.destination.postal_code,
                contrato: deal.number,
                cliente: clientId,
                bultos: [
                    {
                        volumen: `${body.rate.items.reduce((acc, item) => acc + item.grams, 0)}`
                    }
                ]
            }
            console.log("Andreani Payload:", payload)
            
            const response: AndreaniShippingRateResponse = await andreaniService.getShippingRates(payload)
            console.log("Andreani Response:", response)

            shopifyResponse.rates.push({
                service_name: deal.name || "Andreani Service",
                service_code: `${dealSender.id}`,
                total_price: `${response?.tarifaConIva?.total ?? response?.tarifaSinIva?.total ?? 0}`,
                description: "",
                currency: body.rate.currency
            })
        }
    }

    return Response.json(shopifyResponse)
}