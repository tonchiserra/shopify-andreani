import { type HeadersFunction, type LoaderFunctionArgs, useLoaderData, useActionData, useSearchParams } from "react-router"
import { authenticate } from "../shopify.server"
import { boundary } from "@shopify/shopify-app-react-router/server"
import { senderService, locationService, type SenderWithRelations, ShopifyLocation, shopifyLocationService } from "app/lib/services/index"
import { useEffect } from "react"
import SenderForm from "app/components/senderForm"
import { showToast } from "app/lib/utils/toast"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request)
  
  const { id } = params
  const sender = await senderService.getById(`${id}`)
  const locations = await shopifyLocationService.getAll(request)
    
  return { sender, locations } as { sender: SenderWithRelations, locations: ShopifyLocation[] }
}

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request)
  const { id } = params
  
  try {
    const formData = await request.formData()
    
    const senderData = {
      docType: formData.get('docType') as string,
      docNum: formData.get('docNum') as string,
      officeCode: formData.get('officeCode') as string,
    }
    
    const locationData = {
      id: formData.get('locationId') as string,
      name: formData.get('locationName') as string,
      address1: formData.get('address1') as string,
      address2: formData.get('address2') as string || undefined,
      city: formData.get('city') as string,
      province: formData.get('province') as string,
      country: formData.get('country') as string || 'Argentina',
      zip: formData.get('zip') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      active: formData.get('active') === 'on',
    }
    
    const errors: Record<string, string> = {}
    
    if (!senderData.docType) errors.docType = 'El tipo de documento es obligatorio'
    if (!senderData.docNum) errors.docNum = 'El número de documento es obligatorio'
    if (!senderData.officeCode) errors.officeCode = 'El código de oficina es obligatorio'
    if (!locationData.id) errors.locationId = 'Por favor selecciona otra location'
    if (!locationData.name) errors.locationName = 'El nombre es obligatorio'
    if (!locationData.address1) errors.address1 = 'La dirección es obligatoria'
    if (!locationData.city) errors.city = 'La ciudad es obligatoria'
    if (!locationData.province) errors.province = 'La provincia es obligatoria'
    
    if (Object.keys(errors).length > 0) {
      return { 
        success: false, 
        message: 'Por favor completa todos los campos obligatorios',
        errors
      }
    }
    
    const currentSender = await senderService.getById(`${id}`)
    if(!currentSender) throw new Response("Sender not found", { status: 404 })
    
    await locationService.update(currentSender.locationId, locationData)
    await senderService.update(`${id}`, senderData)
    
    return {
      success: true,
      message: 'Remitente actualizado correctamente'
    }
    
  } catch (error) {
    console.error('Error updating sender:', error)
    return { 
      success: false, 
      message: 'Error al actualizar el remitente. Verifica que los datos sean correctos.',
      errors: {}
    }
  }
}

export default function SenderDetail() {
  const { sender, locations } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const success = searchParams.get('success')
    if (success === 'true') {
      showToast('¡Remitente creado exitosamente!', {
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
  }, [actionData])

  return (
    <s-page>
      <s-stack gap="base" padding="base none">
        <s-heading>Editar Remitente</s-heading>

        <SenderForm actionData={actionData} sender={sender} locations={locations} />
      </s-stack>
    </s-page>
  )
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs)
}
