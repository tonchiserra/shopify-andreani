import { type HeadersFunction, type LoaderFunctionArgs, useActionData, redirect, useLoaderData } from "react-router"
import { authenticate } from "../shopify.server"
import { boundary } from "@shopify/shopify-app-react-router/server"
import { senderService, locationService, shopifyLocationService } from "app/lib/services/index"
import { useEffect } from "react"
import SenderForm from "app/components/senderForm"
import { showToast } from "app/lib/utils/toast"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request)

  const locations = await shopifyLocationService.getAll(request)

  return { locations }
}

export const action = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request)
  
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
    
    const newLocation = await locationService.create(locationData)
    
    const newSender = await senderService.create({
      ...senderData,
      locationId: newLocation.id
    })
    
    return redirect(`/app/senders/${newSender.id}?success=true`)
    
  } catch (error) {
    console.error('Error creating sender:', error)
    return { 
      success: false, 
      message: 'Error al crear el remitente. Verifica que los datos sean correctos.',
      errors: {}
    }
  }
}

export default function NewSender() {
  const actionData = useActionData<typeof action>()
  const { locations } = useLoaderData<typeof loader>()
  
  useEffect(() => {
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
        <s-heading>Crear Nuevo Remitente</s-heading>

        <SenderForm actionData={actionData} locations={locations} />
      </s-stack>
    </s-page>
  )
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs)
}