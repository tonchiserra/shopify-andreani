import { type LoaderFunctionArgs, useActionData, useLoaderData, useSearchParams } from "react-router"
import { authenticate } from "../shopify.server"
import { carrierServiceService } from "app/lib/services/index"
import { useEffect } from "react"
import CarrierServiceForm from "app/components/carrierServiceForm"
import { showToast } from "app/lib/utils/shopify-apis"
import { makeShopifyCarrierServiceId } from "app/lib/utils/helpers"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request)

  const { id } = params
  if (!id) throw new Error("ID del carrier service no proporcionado")

  const carrierService = await carrierServiceService.getById(request, makeShopifyCarrierServiceId(id))

  return { carrierService }
}

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request)
  const { id } = params
  
  try {
    const formData = await request.formData()
    
    const carrierServiceData = {
      id: `${makeShopifyCarrierServiceId(`${id}`)}`,
      name: formData.get('name') as string,
      callbackUrl: formData.get('callbackUrl') as string,
      active: formData.get('active') === 'on',
      supportsServiceDiscovery: formData.get('supportsServiceDiscovery') === 'on'
    }
    
    if (!carrierServiceData.name || !carrierServiceData.callbackUrl) {
      return { 
        success: false, 
        message: 'El nombre y la URL de callback son obligatorios',
        errors: {
          name: !carrierServiceData.name ? 'El nombre es obligatorio' : '',
          callbackUrl: !carrierServiceData.callbackUrl ? 'La URL de callback es obligatoria' : ''
        }
      }
    }
    
    if(!id) throw new Error("ID del carrier service no proporcionado")

    await carrierServiceService.update(request, carrierServiceData)
    
    return { success: true, message: 'Carrier service actualizado exitosamente'}
    
  } catch (error) {
    console.error('Error updating carrier service:', error)
    return { 
      success: false, 
      message: 'Error al actualizar el carrier service. Verifica los datos ingresados.',
      errors: {}
    }
  }
}

export default function CarrierServiceDetail() {
  const [searchParams] = useSearchParams()
  const actionData = useActionData<typeof action>()
  const { carrierService } = useLoaderData<typeof loader>()
  
  useEffect(() => {
    const success = searchParams.get('success')
    if (success === 'true') {
      showToast('¡Carrier service creado exitosamente!', {
        duration: 5000,
        isError: false
      })
      
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete('success')
      const newUrl = `${window.location.pathname}${newSearchParams.toString() ? '?' + newSearchParams.toString() : ''}`
      window.history.replaceState({}, '', newUrl)
    }

    if (actionData?.message) {
      showToast(actionData.message, {
        duration: 5000,
        isError: !actionData.success
      })
    }
  }, [searchParams, actionData])


  if(!carrierService) return null
  
  return (
    <s-page>
      <s-stack gap="base" padding="base none">
        <s-heading>Carrier Service &quot;{carrierService?.name ?? carrierService?.formattedName ?? 'Sin nombre'}&quot;</s-heading>

        <CarrierServiceForm actionData={actionData} carrierService={carrierService} />
      </s-stack>
    </s-page>
  )
}