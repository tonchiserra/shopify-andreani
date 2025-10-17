import type { LoaderFunctionArgs } from "react-router"
import { useLoaderData, useActionData } from "react-router"
import { authenticate } from "../shopify.server"
import { carrierServiceService } from "app/lib/services/index"
import { useEffect } from "react"
import { showToast } from "app/lib/utils/shopify-apis"
import CarrierServicesTable from "app/components/carrierServicesTable"
import NoContent from "app/components/noContent"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request)
  
  const carrierServices = await carrierServiceService.getAll(request)
  return { carrierServices }
}

export const action = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request)
  
  try {
    const formData = await request.formData()
    const intent = formData.get('intent')
    const carrierServiceId = formData.get('id') as string
    
    if (intent === 'delete' && carrierServiceId) {
      await carrierServiceService.delete(request, carrierServiceId)
      
      return {
        success: true,
        message: 'Carrier service eliminado exitosamente',
        deletedId: carrierServiceId
      }
    }
    
    return { success: false, message: 'Acción no válida' }
  } catch (error) {
    console.error('Error deleting carrier service:', error)
    return {
      success: false,
      message: 'Error al eliminar el carrier service. Intenta nuevamente.'
    }
  }
}

export default function CarrierServicesIndex() {
  const { carrierServices } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  useEffect(() => {
    if (actionData?.message) {
      showToast(actionData.message, {
        duration: 5000,
        isError: !actionData.success
      })
    }
  }, [actionData])

  return (
    <s-stack gap="base" padding="base none">
      { 
        carrierServices.length === 0 
        ? <NoContent message="No hay carrier services disponibles. Empieza creando uno nuevo." cta="/app/carrier-services/new" ctaLabel="Crear Carrier Service" />
        : <CarrierServicesTable carrierServices={carrierServices} />
      }
    </s-stack>
  )
}