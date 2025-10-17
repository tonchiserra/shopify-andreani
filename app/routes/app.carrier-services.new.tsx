import { type HeadersFunction, type LoaderFunctionArgs, useActionData, redirect } from "react-router"
import { authenticate } from "../shopify.server"
import { boundary } from "@shopify/shopify-app-react-router/server"
import { carrierServiceService } from "app/lib/services/index"
import { useEffect } from "react"
import CarrierServiceForm from "app/components/carrierServiceForm"
import { showToast } from "app/lib/utils/shopify-apis"
import { parseCarrierServiceId } from "app/lib/utils/helpers"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request)
  
  return {}
}

export const action = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request)
  
  try {
    const formData = await request.formData()
    
    const carrierServiceData = {
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

    console.log(carrierServiceData)
    
    const newCarrierService = await carrierServiceService.create(request, carrierServiceData)
    
    return redirect(`/app/carrier-services/${parseCarrierServiceId(newCarrierService.id)}?success=true`)
    
  } catch (error) {
    console.error('Error creating carrier service:', error)
    return { 
      success: false, 
      message: 'Error al crear el carrier service. Verifica los datos ingresados.',
      errors: {}
    }
  }
}

export default function NewCarrierService() {
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
    <s-page>
      <s-stack gap="base" padding="base none">
        <s-heading>Crear Nuevo Carrier Service</s-heading>

        <CarrierServiceForm actionData={actionData} />
      </s-stack>
    </s-page>
  )
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs)
}