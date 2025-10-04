import prisma from "app/db.server"
import type { ShippingQuote } from "@prisma/client"

export type ShippingQuoteWithRelations = ShippingQuote & {
  deal: {
    id: string
    name: string
    number: string
    price: number
    freeShipping: boolean
  }
  sender: {
    id: string
    docType: string
    docNum: string
    officeCode: string
    location: {
      id: string
      name: string
      city?: string
    }
  }
}

export type CreateShippingQuoteInput = {
  dealId: string
  senderId: string
}

export const shippingQuoteService = {
  // CREATE - Create shipping quote relationship
  async create(data: CreateShippingQuoteInput): Promise<ShippingQuote> {
    return prisma.shippingQuote.create({
      data
    })
  },

  // READ - Get all shipping quotes
  async getAll(includeRelations = true): Promise<ShippingQuoteWithRelations[] | ShippingQuote[]> {
    return prisma.shippingQuote.findMany({
      ...(includeRelations && {
        include: {
          deal: {
            select: {
              id: true,
              name: true,
              number: true,
              price: true,
              freeShipping: true
            }
          },
          sender: {
            include: {
              location: {
                select: {
                  id: true,
                  name: true,
                  city: true
                }
              }
            }
          }
        }
      }),
      orderBy: {
        id: 'asc'
      }
    })
  },

  // READ - Get shipping quote by ID
  async getById(id: string, includeRelations = true): Promise<ShippingQuoteWithRelations | ShippingQuote | null> {
    return prisma.shippingQuote.findUnique({
      where: { id },
      ...(includeRelations && {
        include: {
          deal: true,
          sender: {
            include: {
              location: true
            }
          }
        }
      })
    })
  },

  // DELETE - Delete shipping quote
  async delete(id: string): Promise<ShippingQuote> {
    return prisma.shippingQuote.delete({
      where: { id }
    })
  },
}