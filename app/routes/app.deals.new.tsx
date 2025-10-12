import { type HeadersFunction, type LoaderFunctionArgs, useActionData, redirect, useLoaderData } from "react-router"
import { authenticate } from "../shopify.server"
import { boundary } from "@shopify/shopify-app-react-router/server"
import { dealService, senderService } from "app/lib/services/index"
import { useEffect } from "react"
import DealForm from "app/components/dealForm"
import { showToast } from "app/lib/utils/shopify-apis"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request)
  
  const senders = await senderService.getAll(false)
  
  return { senders }
}

export const action = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request)
  
  try {
    const formData = await request.formData()
    
    const senderIds = formData.getAll('senderIds') as string[]
    
    const dealData = {
      name: formData.get('name') as string,
      number: formData.get('number') as string,
      toLocation: formData.get('toLocation') === 'on',
      freeShipping: formData.get('freeShipping') === 'on',
      price: parseFloat(formData.get('price') as string) || 0,
      senderIds: senderIds.filter(id => id.trim() !== '')
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
  const { senders } = useLoaderData<typeof loader>()
  
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
        <s-heading>Crear Nuevo Contrato</s-heading>

        <DealForm actionData={actionData} senders={senders} />
      </s-stack>
    </s-page>
  )
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs)
}