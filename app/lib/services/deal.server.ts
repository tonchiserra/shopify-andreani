import prisma from "app/db.server"
import type { Deal, Sender } from "@prisma/client"

export type DealWithRelations = Deal & {
  senders?: Array<{
    id: string
    sender: Sender
  }>
}

export type CreateDealInput = {
  name: string
  number: string
  toLocation: boolean
  freeShipping?: boolean
  price: number
  senderIds?: string[]
}

export type UpdateDealInput = Partial<Omit<CreateDealInput, 'number'>> & {
  senderIds?: string[]
}

export const dealService = {
  // CREATE - Create a new deal
  async create(data: CreateDealInput): Promise<Deal> {
    const { senderIds, ...dealData } = data
    
    return prisma.deal.create({
      data: {
        ...dealData,
        ...(senderIds && senderIds.length > 0 && {
          senders: {
            create: senderIds.map(senderId => ({
              sender: { connect: { id: senderId } }
            }))
          }
        })
      }
    })
  },

  // READ - Get all deals
  async getAll(includeRelations = true): Promise<DealWithRelations[]> {
    return prisma.deal.findMany({
      ...(includeRelations && {
        include: {
          senders: {
            include: {
              sender: true
            }
          }
        }
      }),
      orderBy: {
        createdAt: 'desc'
      }
    })
  },

  // READ - Get deal by ID
  async getById(id: string, includeRelations = true): Promise<DealWithRelations | null> {
    return prisma.deal.findUnique({
      where: { id },
      ...(includeRelations && {
        include: {
          senders: {
            include: {
              sender: true
            }
          }
        }
      })
    })
  },

  // READ - Get deal by number
  async getByNumber(number: string): Promise<Deal | null> {
    return prisma.deal.findUnique({
      where: { number }
    })
  },

  // UPDATE - Update deal
  async update(id: string, data: UpdateDealInput): Promise<Deal> {
    const { senderIds, ...dealData } = data
    
    return prisma.$transaction(async (tx) => {
      const updatedDeal = await tx.deal.update({
        where: { id },
        data: dealData
      })

      if(senderIds !== undefined) {
        await tx.shippingQuote.deleteMany({
          where: { dealId: id }
        })

        if(senderIds.length > 0) {
          await tx.shippingQuote.createMany({
            data: senderIds.map(senderId => ({
              dealId: id,
              senderId
            }))
          })
        }
      }

      return updatedDeal
    })
  },

  // DELETE - Delete deal
  async delete(id: string): Promise<Deal> {
    return prisma.deal.delete({
      where: { id }
    })
  },
}