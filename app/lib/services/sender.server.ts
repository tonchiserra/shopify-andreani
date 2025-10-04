import prisma from "app/db.server"
import type { Sender } from "@prisma/client"

export type SenderWithRelations = Sender & {
  location: {
    id: string
    name: string
    address1?: string
    address2?: string
    city?: string
    province?: string
    country?: string
    zip?: string
    phone?: string
    active: boolean
  }
  deals?: Array<{
    id: string
    deal: {
      id: string
      name: string
      number: string
      price: number
    }
  }>
}

export type CreateSenderInput = {
  docType: string
  docNum: string
  officeCode: string
  locationId: string
}

export type UpdateSenderInput = Partial<CreateSenderInput>

export const senderService = {
  // CREATE - Create a new sender
  async create(data: CreateSenderInput): Promise<Sender> {
    return prisma.sender.create({
      data
    })
  },

  // READ - Get all senders
  async getAll(includeRelations = true): Promise<SenderWithRelations[] | Sender[]> {
    return prisma.sender.findMany({
      ...(includeRelations && {
        include: {
          location: true,
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
          location: true,
          deals: {
            include: {
              deal: true
            }
          }
        }
      })
    })
  },

  // READ - Get senders by location
  async getByLocationId(locationId: string): Promise<Sender | null> {
    return prisma.sender.findFirst({
      where: {
        locationId
      },
      include: {
        location: true
      }
    })
  },

  // UPDATE - Update sender
  async update(id: string, data: UpdateSenderInput): Promise<Sender> {
    return prisma.sender.update({
      where: { id },
      data
    })
  },

  // DELETE - Delete sender
  async delete(id: string): Promise<Sender> {
    return prisma.sender.delete({
      where: { id }
    })
  },
}