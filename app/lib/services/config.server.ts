import prisma from "app/db.server"
import type { Config, ConfigAccessData } from "@prisma/client"

export type AppMode = 'manual' | 'auto'

export type ConfigWithRelations = Config & {
  accessData?: ConfigAccessData | null
}

export type CreateConfigInput = {
  enabled?: boolean
  isProduction?: boolean
  freeShippingThreshold?: number
  appMode?: AppMode
  defaultWeight?: number
  accessData?: {
    user: string
    pass: string
    clientId: string
    urlProd: string
    urlTest: string
  }
}

export type UpdateConfigInput = Partial<CreateConfigInput>

export const configService = {
  // CREATE - Create config (singleton)
  async create(data: CreateConfigInput): Promise<ConfigWithRelations | null> {
    const { accessData, ...configData } = data
    
    return prisma.$transaction(async (tx) => {
      const config = await tx.config.create({
        data: configData
      })
      
      if(accessData) {
        await tx.configAccessData.create({
          data: {
            ...accessData,
            configId: config.id
          }
        })
      }
      
      return this.getConfig()
    })
  },

  // READ - Get config (singleton)
  async getConfig(): Promise<ConfigWithRelations | null> {
    return prisma.config.findUnique({
      where: { id: 'config' },
      include: {
        accessData: true
      }
    })
  },

  // READ - Get or create config
  async getOrCreateConfig(): Promise<ConfigWithRelations | null> {
    let config = await this.getConfig();
    
    if(!config) {
      config = await this.create({
        enabled: true,
        isProduction: false,
        appMode: 'manual'
      })
    }
    
    return config
  },

  // UPDATE - Update config
  async update(data: UpdateConfigInput): Promise<ConfigWithRelations | null> {
    const { accessData, ...configData } = data
    
    return prisma.$transaction(async (tx) => {
      await tx.config.update({
        where: { id: 'config' },
        data: configData
      })
      
      if(accessData) {
        const existingAccessData = await tx.configAccessData.findUnique({
          where: { configId: 'config' }
        })
        
        if(existingAccessData) {
          await tx.configAccessData.update({
            where: { configId: 'config' },
            data: accessData
          })
        }else {
          await tx.configAccessData.create({
            data: {
              ...accessData,
              configId: 'config'
            }
          })
        }
      }
      
      return this.getConfig()
    })
  },

  // DELETE - Delete config
  async delete(): Promise<Config> {
    return prisma.config.delete({
      where: { id: 'config' }
    })
  },

  // UTILITY - Check if config exists
  async exists(): Promise<boolean> {
    const config = await prisma.config.findUnique({
      where: { id: 'config' },
      select: { id: true }
    })
    
    return config !== null
  },

  // UTILITY - Get active API URL
  async getActiveApiUrl(): Promise<string | null> {
    const config = await this.getConfig()
    
    if(!config || !config.accessData) return null
    
    return config.isProduction ? config.accessData.urlProd : config.accessData.urlTest
  }
}