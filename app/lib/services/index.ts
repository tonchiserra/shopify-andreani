// Export all services for easy importing
export { dealService } from "./deal.server"
export { senderService } from "./sender.server"
export { locationService } from "./location.server"
export { configService } from "./config.server"
export { shippingQuoteService } from "./shipping-quote.server"
export { carrierServiceService } from "./carrier-service.server"
export { andreaniService } from "./andreani.server"

// Export all types for easy importing
export type {
  DealWithRelations,
  CreateDealInput,
  UpdateDealInput
} from "./deal.server"

export type {
  SenderWithRelations,
  CreateSenderInput,
  UpdateSenderInput
} from "./sender.server"

export type {
  ShopifyLocation,
} from "./location.server"

export type {
  ConfigWithRelations,
  CreateConfigInput,
  UpdateConfigInput,
  AppMode
} from "./config.server"

export type {
  ShippingQuoteWithRelations,
  CreateShippingQuoteInput
} from "./shipping-quote.server"

export type {
  DeliveryCarrierService,
  DeliveryCarrierServiceCreateInput,
  DeliveryCarrierServiceUpdateInput
} from "./carrier-service.server"

export type {
  ShopifyShippingRateRequest,
  ShopifyShippingRate,
  ShopifyShippingRateResponse,
  AndreaniShippingRateRequest,
  AndreaniShippingRateResponse
} from "./andreani.server"