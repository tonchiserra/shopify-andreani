import { type LoaderFunctionArgs, useActionData, useLoaderData, useSearchParams } from "react-router"
import { authenticate } from "../shopify.server"
import { dealService, senderService } from "app/lib/services/index"
import { useEffect } from "react"
import DealForm from "app/components/dealForm"
import { showToast } from "app/lib/utils/shopify-apis"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request)

  const { id } = params
  const [deal, senders] = await Promise.all([
    dealService.getById(`${id}`),
    senderService.getAll(false)
  ])

  return { deal, senders }
}

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request)
  const { id } = params
  
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
    
    if(!id) throw new Error("ID del contrato no proporcionado")

    await dealService.update(id, dealData)
    
    return { success: true, message: 'Contrato actualizado exitosamente'}
    
  } catch (error) {
    console.error('Error creating deal:', error)
    return { 
      success: false, 
      message: 'Error al crear el contrato. Verifica que el número no esté duplicado.',
      errors: {}
    }
  }
}

export default function DealDetail() {
  const [searchParams] = useSearchParams()
  const actionData = useActionData<typeof action>()
  const { deal, senders } = useLoaderData<typeof loader>()
  
  useEffect(() => {
    const success = searchParams.get('success')
    if (success === 'true') {
      showToast('¡Contrato creado exitosamente!', {
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


  if(!deal) return null
  
  return (
    <s-page>
      <s-stack gap="base" padding="base none">
        <s-heading>Contrato &quot;{deal.name}&quot;</s-heading>

        <DealForm actionData={actionData} deal={deal} senders={senders} />
      </s-stack>
    </s-page>
  )
}
