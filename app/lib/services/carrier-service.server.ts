import { authenticate } from "app/shopify.server"

export type DeliveryCarrierService = {
    id: string
    active: boolean
    availableServicesForCountries: Array<{
        countries: {
            countryCodes: Array<string>
            restOfWorld: boolean
        }
        name: string
    }>
    callbackUrl?: string
    formattedName?: string
    icon: {
        url: string
        altText?: string
    }
    name?: string
    supportsServiceDiscovery: boolean
}

export type DeliveryCarrierServiceCreateInput = {
    active:                     boolean
    callbackUrl:                string
    name:                       string
    supportsServiceDiscovery:   boolean
}

export type DeliveryCarrierServiceUpdateInput = Partial<DeliveryCarrierServiceCreateInput> & {
    id: string
}

export type CarrierServiceDeleteInput = { id: string }

export const carrierServiceService = {
    
    async create(request: Request, data: DeliveryCarrierServiceCreateInput): Promise<DeliveryCarrierService> {
        const { admin } = await authenticate.admin(request)

        const mutation = `
            mutation createCarrierService($input: DeliveryCarrierServiceCreateInput!) {
                carrierServiceCreate(input: $input) {
                    carrierService {
                        id
                        active
                        callbackUrl
                        formattedName
                        name
                        supportsServiceDiscovery
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }
        `

        const variables = {
            input: {
                active: data.active,
                callbackUrl: data.callbackUrl,
                name: data.name,
                supportsServiceDiscovery: data.supportsServiceDiscovery
            }
        }

        const response = await admin.graphql(mutation, { variables })
        const result = await response.json()

        if('errors' in result && result.errors) throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`)

        if(result.data.carrierServiceCreate.userErrors.length > 0) {
            throw new Error(`User Errors: ${JSON.stringify(result.data.carrierServiceCreate.userErrors)}`)
        }

        return result.data.carrierServiceCreate.carrierService as DeliveryCarrierService
    },

    async getAll(request: Request): Promise<DeliveryCarrierService[]> {
        const { admin } = await authenticate.admin(request)

        const query = `
            query getCarrierServices {
                carrierServices(first: 250) {
                    edges {
                        node {
                            id
                            active
                            name
                            callbackUrl
                            supportsServiceDiscovery
                        }
                    }
                }
            }
        `

        const response = await admin.graphql(query)
        const result = await response.json()

        if('errors' in result && result.errors) throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`)

        return result.data.carrierServices.edges.map((edge: { node: DeliveryCarrierService }) => edge.node) as DeliveryCarrierService[]
    },

    async getById(request: Request, id: string): Promise<DeliveryCarrierService | null> {
        const { admin } = await authenticate.admin(request)

        const query = `
            query getCarrierService($id: ID!) {
                carrierService(id: $id) {
                    id
                    active
                    callbackUrl
                    name
                    supportsServiceDiscovery
                }
            }
        `

        const variables = { id }

        const response = await admin.graphql(query, { variables })
        const result = await response.json()

        if('errors' in result && result.errors) throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`)

        return result.data.carrierService as DeliveryCarrierService | null
    },

    async update(request: Request, data: DeliveryCarrierServiceUpdateInput): Promise<DeliveryCarrierService> {
        const { admin } = await authenticate.admin(request)

        const mutation = `
            mutation updateCarrierService($input: DeliveryCarrierServiceUpdateInput!) {
                carrierServiceUpdate(input: $input) {
                    carrierService {
                        id
                        active
                        callbackUrl
                        formattedName
                        name
                        supportsServiceDiscovery
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }
        `

        const variables = {
            input: {
                id: data.id,
                ...(data.active !== undefined && { active: data.active }),
                ...(data.callbackUrl && { callbackUrl: data.callbackUrl }),
                ...(data.name && { name: data.name }),
                ...(data.supportsServiceDiscovery !== undefined && { supportsServiceDiscovery: data.supportsServiceDiscovery })
            }
        }

        const response = await admin.graphql(mutation, { variables })
        const result = await response.json()

        if('errors' in result && result.errors) throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`)

        if(result.data.carrierServiceUpdate.userErrors.length > 0) {
            throw new Error(`User Errors: ${JSON.stringify(result.data.carrierServiceUpdate.userErrors)}`)
        }

        return result.data.carrierServiceUpdate.carrierService as DeliveryCarrierService
    },

    async delete(request: Request, id: string): Promise<boolean> {
        const { admin } = await authenticate.admin(request)

        const mutation = `
            mutation deleteCarrierService($id: ID!) {
                carrierServiceDelete(id: $id) {
                    deletedId
                    userErrors {
                        field
                        message
                    }
                }
            }
        `

        const variables = { id }

        const response = await admin.graphql(mutation, { variables })
        const result = await response.json()

        if('errors' in result && result.errors) throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`)

        if(result.data.carrierServiceDelete.userErrors.length > 0) {
            throw new Error(`User Errors: ${JSON.stringify(result.data.carrierServiceDelete.userErrors)}`)
        }

        return !!result.data.carrierServiceDelete.deletedCarrierServiceId
    }
}