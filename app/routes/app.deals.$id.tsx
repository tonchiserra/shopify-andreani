import { type LoaderFunctionArgs, useActionData, useLoaderData, useSearchParams } from "react-router"
import { authenticate } from "../shopify.server"
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

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request)

  const { id } = params
  const deal = await dealService.getById(`${id}`)

  return deal
}

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request)
  const { id } = params
  
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
  const currentDeal = useLoaderData<typeof loader>()
  
  useEffect(() => {
    const success = searchParams.get('success');

    if (success === 'true' && typeof window !== 'undefined' && window.shopify?.toast) {
      window.shopify.toast.show('¡Contrato creado exitosamente!', {
        duration: 5000,
        isError: false
      });
      
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('success');
      const newUrl = `${window.location.pathname}${newSearchParams.toString() ? '?' + newSearchParams.toString() : ''}`;
      window.history.replaceState({}, '', newUrl);
    }

    if (actionData?.message && typeof window !== 'undefined' && window.shopify?.toast) {
      window.shopify.toast.show(actionData.message, {
        duration: 5000,
        isError: !actionData.success
      })
    }
  }, [searchParams, actionData])


  if(!currentDeal) return null
  
  return (
    <s-page>
      <s-stack gap="base" padding="base none">
        <s-heading>Contrato &quot;{currentDeal.name}&quot;</s-heading>

        <DealForm actionData={actionData} deal={currentDeal} />
      </s-stack>
    </s-page>
  );
}
