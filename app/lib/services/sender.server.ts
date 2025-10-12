import prisma from "app/db.server"
import { Sender, Deal } from "@prisma/client"

export type SenderWithRelations = Sender & {
  deals?: Array<{
    id: string
    deal: Deal
  }>
}

export type CreateSenderInput = {
  docType: string
  docNum: string
  officeCode: string
  active?: boolean
  locationId: string
  locationName?: string
  locationAddress1?: string
  locationAddress2?: string
  locationCity?: string
  locationProvince?: string
  locationCountry?: string
  locationZip?: string
  locationPhone?: string
  dealIds?: string[]
}

export type UpdateSenderInput = Partial<CreateSenderInput>

export const senderService = {
  // CREATE - Create a new sender
  async create(data: CreateSenderInput): Promise<Sender> {
    const { dealIds, ...senderData } = data
    
    return prisma.sender.create({
      data: {
        ...senderData,
        ...(dealIds && dealIds.length > 0 && {
          deals: {
            create: dealIds.map(dealId => ({
              deal: { connect: { id: dealId } }
            }))
          }
        })
      }
    })
  },

  // READ - Get all senders
  async getAll(includeRelations = true): Promise<SenderWithRelations[] | Sender[]> {
    return prisma.sender.findMany({
      ...(includeRelations && {
        include: {
          deals: {
            include: {
              deal: {
                select: {
                  id: true,
                  name: true,
                  number: true,
                  price: true
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

  // READ - Get sender by ID
  async getById(id: string, includeRelations = true): Promise<SenderWithRelations | Sender | null> {
    return prisma.sender.findUnique({
      where: { id },
      ...(includeRelations && {
        include: {
          deals: {
            include: {
              deal: true
            }
          }
        }
      })
    })
  },

  // UPDATE - Update sender
  async update(id: string, data: UpdateSenderInput): Promise<Sender> {
    const { dealIds, ...senderData } = data
    
    return prisma.$transaction(async (tx) => {
      const updatedSender = await tx.sender.update({
        where: { id },
        data: senderData
      })

      if(dealIds !== undefined) {
        await tx.shippingQuote.deleteMany({
          where: { senderId: id }
        })

        if(dealIds.length > 0) {
          await tx.shippingQuote.createMany({
            data: dealIds.map(dealId => ({
              senderId: id,
              dealId
            }))
          })
        }
      }

      return updatedSender
    })
  },

  // DELETE - Delete sender
  async delete(id: string): Promise<Sender> {
    return prisma.sender.delete({
      where: { id }
    })
  },
}