import { type HeadersFunction, type LoaderFunctionArgs, useActionData, redirect, useLoaderData } from "react-router"
import { authenticate } from "../shopify.server"
import { boundary } from "@shopify/shopify-app-react-router/server"
import { senderService, locationService, dealService } from "app/lib/services/index"
import { useEffect } from "react"
import SenderForm from "app/components/senderForm"
import { showToast } from "app/lib/utils/shopify-apis"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request)

  const [locations, deals, senders] = await Promise.all([
    locationService.getAll(request),
    dealService.getAll(false),
    senderService.getAll(false)
  ])

  return { locations, deals, senders }
}

export const action = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request)
  
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
    
    const newSender = await senderService.create(senderData)
    
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
  const { locations, deals, senders } = useLoaderData<typeof loader>()
  
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

        <SenderForm actionData={actionData} locations={locations} deals={deals} senders={senders} />
      </s-stack>
    </s-page>
  )
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs)
}