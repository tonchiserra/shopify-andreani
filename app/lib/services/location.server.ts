import prisma from "app/db.server"
import type { Location } from "@prisma/client"

export type LocationWithRelations = Location & {
  sender?: {
    id: string
    docType: string
    docNum: string
    officeCode: string
  } | null
}

export type CreateLocationInput = {
  name: string
  address1?: string
  address2?: string
  city?: string
  province?: string
  country?: string
  zip?: string
  phone?: string
  active?: boolean
}

export type UpdateLocationInput = Partial<CreateLocationInput>

export const locationService = {
  // CREATE - Create a new location
  async create(data: CreateLocationInput): Promise<Location> {
    return prisma.location.create({
      data
    })
  },

  // READ - Get all locations
  async getAll(includeRelations = true): Promise<LocationWithRelations[]> {
    return prisma.location.findMany({
      ...(includeRelations && {
        include: {
          sender: {
            select: {
              id: true,
              docType: true,
              docNum: true,
              officeCode: true
            }
          }
        }
      }),
      orderBy: {
        name: 'asc'
      }
    })
  },

  // READ - Get location by ID
  async getById(id: string, includeRelations = true): Promise<LocationWithRelations | null> {
    return prisma.location.findUnique({
      where: { id },
      ...(includeRelations && {
        include: {
          sender: true
        }
      })
    })
  },

  // READ - Get active locations
  async getActive(): Promise<Location[]> {
    return prisma.location.findMany({
      where: {
        active: true
      },
      orderBy: {
        name: 'asc'
      }
    })
  },

  // UPDATE - Update location
  async update(id: string, data: UpdateLocationInput): Promise<Location> {
    return prisma.location.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })
  },

  // DELETE - Delete location
  async delete(id: string): Promise<Location> {
    return prisma.location.delete({
      where: { id }
    })
  },
}