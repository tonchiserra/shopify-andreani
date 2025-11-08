import type { LoaderFunctionArgs } from "react-router"
import { type ShopifyShippingRateRequest, type ShopifyShippingRateResponse, type AndreaniShippingRateRequest, type AndreaniShippingRateResponse, andreaniService, configService, senderService } from "app/lib/services/index"

export const action = async ({ request }: LoaderFunctionArgs) => {
    if(request.method !== 'POST') return new Response('Method not allowed', { status: 405 })

    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) return new Response('Invalid content type', { status: 400 })

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) return new Response('Unauthorized', { status: 401 })

    const shopifyResponse: ShopifyShippingRateResponse = {
        rates: []
    }

    const config = await configService.getConfig()
    if(!config || !config.enabled) return Response.json(shopifyResponse)

    const body = await request.json() as ShopifyShippingRateRequest
    if(!body.rate) return Response.json(shopifyResponse)
    console.log("Body:", body)

    const senders = await senderService.getAll()
    if(!senders || senders.length === 0) return Response.json(shopifyResponse)

    const clientId = await configService.getClientId()
    if(!clientId) return Response.json(shopifyResponse)

    const orderSubtotal = body.rate.items.reduce((acc, item) => acc + ((item.price/100) * item.quantity), 0)

    for(let i=0; i<senders.length; i++) {
        const sender = senders[i]
        if(!sender.active) continue
        if(body.rate.origin.postal_code !== sender.locationZip || body.rate.origin.address1 !== sender.locationAddress1) continue
        if(!sender.deals || sender.deals?.length === 0) continue

        for(let j=0; j<sender.deals.length; j++) {
            const senderDeal = sender.deals[j]

            if(senderDeal.deal.freeShipping && orderSubtotal >= Number(config?.freeShippingThreshold)) {
                shopifyResponse.rates.push({
                    service_name: senderDeal.deal.name || "Andreani Service",
                    service_code: `${senderDeal.id}`,
                    total_price: 0,
                    description: "",
                    currency: body.rate.currency
                })

                continue
            }

            const payload: AndreaniShippingRateRequest = {
                cpDestino: senderDeal.deal.toLocation ? (sender.locationZip ?? '') : body.rate.destination.postal_code,
                contrato: senderDeal.deal.number,
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

            const responseTotal = Number(response?.tarifaConIva?.total) ?? Number(response?.tarifaSinIva?.total) ?? 0

            shopifyResponse.rates.push({
                service_name: senderDeal.deal.name || "Andreani Service",
                service_code: `${senderDeal.id}`,
                total_price: Math.round(responseTotal * 100),
                description: "",
                currency: body.rate.currency
            })
        }
    }

    console.log("Shopify Response:", shopifyResponse)

    return Response.json(shopifyResponse)
}