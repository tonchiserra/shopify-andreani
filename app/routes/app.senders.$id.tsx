import { type HeadersFunction, type LoaderFunctionArgs, useLoaderData, useActionData, useSearchParams } from "react-router"
import { authenticate } from "../shopify.server"
import { boundary } from "@shopify/shopify-app-react-router/server"
import { senderService, locationService, dealService, type SenderWithRelations, ShopifyLocation, DealWithRelations } from "app/lib/services/index"
import { useEffect } from "react"
import SenderForm from "app/components/senderForm"
import { showToast } from "app/lib/utils/shopify-apis"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request)
  
  const { id } = params
  const [sender, locations, deals, senders] = await Promise.all([
    senderService.getById(`${id}`),
    locationService.getAll(request),
    dealService.getAll(false),
    senderService.getAll(false)
  ])

  return { sender, locations, deals, senders } as { sender: SenderWithRelations, locations: ShopifyLocation[], deals: DealWithRelations[], senders: SenderWithRelations[] }
}

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request)
  const { id } = params
  
  try {
    const formData = await request.formData()
    
    const dealIds = formData.getAll('dealIds') as string[]
    
    const senderData = {
      docType: formData.get('docType') as string,
      docNum: formData.get('docNum') as string,
      officeCode: formData.get('officeCode') as string,
      active: formData.get('active') === 'on',
      locationId: formData.get('locationId') as string,
      locationName: formData.get('locationName') as string,
      locationAddress1: formData.get('locationAddress1') as string,
      locationAddress2: formData.get('locationAddress2') as string,
      locationCity: formData.get('locationCity') as string,
      locationProvince: formData.get('locationProvince') as string,
      locationCountry: formData.get('locationCountry') as string,
      locationZip: formData.get('locationZip') as string,
      locationPhone: formData.get('locationPhone') as string,
      dealIds: dealIds.filter(id => id.trim() !== '')
    }
    
    const errors: Record<string, string> = {}
    
    if (!senderData.docType) errors.docType = 'El tipo de documento es obligatorio'
    if (!senderData.docNum) errors.docNum = 'El número de documento es obligatorio'
    if (!senderData.officeCode) errors.officeCode = 'El código de oficina es obligatorio'
    if (!senderData.locationId) errors.locationId = 'La location es obligatoria'
    if (!senderData.locationName) errors.locationName = 'El nombre de la location es obligatoria'

    
    if (Object.keys(errors).length > 0) {
      return { 
        success: false, 
        message: 'Por favor completa todos los campos obligatorios',
        errors
      }
    }
    
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
  const [searchParams] = useSearchParams()
  const actionData = useActionData<typeof action>()
  const { sender, locations, deals, senders } = useLoaderData<typeof loader>()
  
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
  }, [actionData, searchParams])

  return (
    <s-page>
      <s-stack gap="base" padding="base none">
        <s-heading>Editar Remitente</s-heading>

        <SenderForm actionData={actionData} sender={sender} locations={locations} deals={deals} senders={senders} />
      </s-stack>
    </s-page>
  )
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs)
}
