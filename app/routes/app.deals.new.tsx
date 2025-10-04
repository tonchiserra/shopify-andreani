import { type HeadersFunction, type LoaderFunctionArgs, useActionData, redirect } from "react-router"
import { authenticate } from "../shopify.server"
import { boundary } from "@shopify/shopify-app-react-router/server"
import { dealService } from "app/lib/services/index"
import { useEffect } from "react"
import DealForm from "app/components/dealForm"

declare global {
  interface Window {
    shopify?: {
      toast?: {
        show: (message: string, options?: { duration?: number; isError?: boolean }) => string;
        hide: (id: string) => void;
      }
    }
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request)
  
  // Por ahora retornamos un objeto vacío, más adelante podemos agregar datos necesarios
  // como lista de senders disponibles para seleccionar
  return { senders: [] }
}

export const action = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request)
  
  try {
    const formData = await request.formData()
    
    const dealData = {
      name: formData.get('name') as string,
      number: formData.get('number') as string,
      toLocation: formData.get('toLocation') === 'on',
      freeShipping: formData.get('freeShipping') === 'on',
      price: parseFloat(formData.get('price') as string) || 0,
    }
    
    if (!dealData.name || !dealData.number) {
      return { 
        success: false, 
        message: 'El nombre y número del contrato son obligatorios',
        errors: {
          name: !dealData.name ? 'El nombre es obligatorio' : '',
          number: !dealData.number ? 'El número es obligatorio' : ''
        }
      }
    }
    
    const newDeal = await dealService.create(dealData)
    
    return redirect(`/app/deals/${newDeal.id}?success=true`)
    
  } catch (error) {
    console.error('Error creating deal:', error)
    return { 
      success: false, 
      message: 'Error al crear el contrato. Verifica que el número no esté duplicado.',
      errors: {}
    }
  }
}

export default function NewDeal() {
  const actionData = useActionData<typeof action>()
  
  useEffect(() => {
    if (actionData?.message && typeof window !== 'undefined' && window.shopify?.toast) {
      window.shopify.toast.show(actionData.message, {
        duration: 5000,
        isError: !actionData.success
      })
    }
  }, [actionData])

  return (
    <s-page>
      <s-stack gap="base" padding="base none">
        <s-heading>Crear Nuevo Contrato</s-heading>

        <DealForm actionData={actionData} />
      </s-stack>
    </s-page>
  )
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs)
}