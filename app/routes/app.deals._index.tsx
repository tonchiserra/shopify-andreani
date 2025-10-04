import type { LoaderFunctionArgs } from "react-router"
import { useLoaderData, Form, useActionData } from "react-router"
import { authenticate } from "../shopify.server"
import { dealService } from "app/lib/services/index"
import { useEffect } from "react"

declare global {
  interface Window {
    shopify?: {
      toast?: {
        show: (message: string, options?: { duration?: number; isError?: boolean }) => string
        hide: (id: string) => void
      }
    }
  }
}

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
    if (actionData?.message && typeof window !== 'undefined' && window.shopify?.toast) {
      window.shopify.toast.show(actionData.message, {
        duration: 5000,
        isError: !actionData.success
      })
    }
  }, [actionData])

  const handleDeleteClick = (dealId: string, dealName: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el contrato "${dealName}"? Esta acción no se puede deshacer.`)) {
      const form = document.getElementById(`delete-form-${dealId}`) as HTMLFormElement;
      if (form) {
        form.submit();
      }
    }
  }

  return (
    <s-stack gap="base" padding="base none">
      <s-stack direction="inline" justifyContent="space-between" alignItems="center">
        <s-heading>Contratos</s-heading>
        <s-button href="/app/deals/new" variant="primary">Crear Contrato</s-button>
      </s-stack>

      <s-box borderRadius="large" overflow="hidden" border="base">
        <s-table>
          <s-table-header-row>
            <s-table-header>#</s-table-header>
            <s-table-header>Nombre</s-table-header>
            <s-table-header>Nº Contrato</s-table-header>
            <s-table-header>Precio</s-table-header>
            <s-table-header>¿Envío sucursal?</s-table-header>
            <s-table-header>¿Envío gratis?</s-table-header>
            <s-table-header></s-table-header>
          </s-table-header-row>

          <s-table-body>
            {deals.length === 0 ? (
              <s-table-row>
                <s-table-cell>
                  <s-stack gap="base" padding="large" alignItems="center">
                    <s-text color="subdued">No hay contratos creados</s-text>
                    <s-button href="/app/deals/new" variant="primary">Crear tu primer contrato</s-button>
                  </s-stack>
                </s-table-cell>
                <s-table-cell></s-table-cell>
                <s-table-cell></s-table-cell>
                <s-table-cell></s-table-cell>
                <s-table-cell></s-table-cell>
                <s-table-cell></s-table-cell>
                <s-table-cell></s-table-cell>
              </s-table-row>
            ) : (
              deals.map((deal) => (
                <s-table-row key={deal.id}>
                  <s-table-cell>{deal.id}</s-table-cell>
                  <s-table-cell>
                    <s-clickable href={`/app/deals/${deal.id}`} padding="small small-400" borderRadius="small">
                      {deal.name}
                    </s-clickable>
                  </s-table-cell>
                  <s-table-cell>{deal.number}</s-table-cell>
                  <s-table-cell>${deal.price.toFixed(2)}</s-table-cell>
                  <s-table-cell>
                    <s-badge tone={deal.toLocation ? "success" : "critical"}>
                      {deal.toLocation ? "Sí" : "No"}
                    </s-badge>
                  </s-table-cell>
                  <s-table-cell>
                    <s-badge tone={deal.freeShipping ? "success" : "critical"}>
                      {deal.freeShipping ? "Sí" : "No"}
                    </s-badge>
                  </s-table-cell>
                  <s-table-cell>
                    <s-grid gridTemplateColumns="auto auto" justifyContent="end" gap="small-300">
                      <s-button icon="edit" variant="primary" href={`/app/deals/${deal.id}`}></s-button>
                      
                      <Form method="post" id={`delete-form-${deal.id}`} style={{ display: 'inline' }}>
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="dealId" value={deal.id} />
                        <s-button 
                          icon="delete" 
                          variant="primary" 
                          tone="critical"
                          type="button"
                          onClick={() => handleDeleteClick(deal.id, deal.name)}
                        ></s-button>
                      </Form>
                    </s-grid>
                  </s-table-cell>
                </s-table-row>
              ))
            )}
          </s-table-body>
        </s-table>
      </s-box>
    </s-stack>
  )
}
