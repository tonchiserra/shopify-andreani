import { authenticate } from "app/shopify.server"

export type ShopifyLocation = {
  id: string
  name: string
  address: {
    address1?: string
    address2?: string
    city?: string
    province?: string
    country?: string
    zip?: string
    phone?: string
  }
  isActive: boolean
}

export const locationService = {

  async getAll(request: Request): Promise<ShopifyLocation[]> {
    const { admin } = await authenticate.admin(request)

    const query = `
      query getLocations {
        locations(first: 100) {
          nodes {
            id
            name
            address {
              address1
              address2
              city
              province
              country
              zip
              phone
            }
            isActive
          }
        }
      }
    `
    
    const response = await admin.graphql(query)
    const result = await response.json()
    
    if('errors' in result && result.errors) throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`)

    if(!result.data || !result.data.locations) throw new Error('No location data returned from Shopify')

    return result.data.locations.nodes as ShopifyLocation[]
  }
}