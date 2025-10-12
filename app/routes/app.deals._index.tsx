import type { LoaderFunctionArgs } from "react-router"
import { useLoaderData, useActionData } from "react-router"
import { authenticate } from "../shopify.server"
import { dealService } from "app/lib/services/index"
import { useEffect } from "react"
import { showToast } from "app/lib/utils/shopify-apis"
import DealsTable from "app/components/dealsTable"
import NoContent from "app/components/noContent"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request)
  
  const deals = await dealService.getAll()
  return { deals }
}

export const action = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request)
  
  try {
    const formData = await request.formData()
    const intent = formData.get('intent')
    const dealId = formData.get('dealId') as string
    
    if (intent === 'delete' && dealId) {
      await dealService.delete(dealId)
      
      return {
        success: true,
        message: 'Contrato eliminado exitosamente',
        deletedId: dealId
      }
    }
    
    return { success: false, message: 'Acción no válida' }
  } catch (error) {
    console.error('Error deleting deal:', error)
    return {
      success: false,
      message: 'Error al eliminar el contrato. Intenta nuevamente.'
    }
  }
}

export default function DealsIndex() {
  const { deals } = useLoaderData<typeof loader>()
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
    <s-stack gap="base" padding="base none">
      <s-stack direction="inline" justifyContent="space-between" alignItems="center">
        <s-heading>Contratos</s-heading>
        <s-button href="/app/deals/new" variant="primary">Crear Contrato</s-button>
      </s-stack>

      { 
        deals.length === 0 
        ? <NoContent message="No hay contratos disponibles. Empieza creando uno nuevo." cta="/app/deals/new" ctaLabel="Crear Contrato" />
        : <DealsTable deals={deals} />
      }
    </s-stack>
  )
}
