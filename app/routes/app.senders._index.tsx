import { useLoaderData, type LoaderFunctionArgs, useActionData, Form } from "react-router"
import { authenticate } from "../shopify.server"
import { useEffect } from "react"
import { senderService, type SenderWithRelations } from "app/lib/services/index"
import { showToast } from "app/lib/utils/toast"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request)
  
  const senders = await senderService.getAll(true)

  return { senders }
}

export const action = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request)
  
  try {
    const formData = await request.formData()
    const intent = formData.get('intent')
    const senderId = formData.get('senderId') as string
    
    if (intent === 'delete' && senderId) {
      await senderService.delete(senderId)
      
      return {
        success: true,
        message: 'Contrato eliminado exitosamente',
        deletedId: senderId
      }
    }
    
    return { success: false, message: 'Acción no válida' }
  } catch (error) {
    console.error('Error deleting sender:', error)
    return {
      success: false,
      message: 'Error al eliminar el remitente. Intenta nuevamente.'
    }
  }
}

export default function Index() {
  const { senders } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  useEffect(() => {
    if (actionData?.message) {
      showToast(actionData.message, {
        duration: 5000,
        isError: !actionData.success
      })
    }
  }, [actionData])

  const handleDeleteClick = (senderId: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el remitente? Esta acción no se puede deshacer.`)) {
      const form = document.getElementById(`delete-form-${senderId}`) as HTMLFormElement
      if(form) form.submit()
    }
  }

  return (
    <s-stack gap="base" padding="base none">
      <s-stack direction="inline" justifyContent="space-between" alignItems="center">
        <s-heading>Remitentes</s-heading>
        <s-button href="/app/senders/new" variant="primary">Crear Remitente</s-button>
      </s-stack>

      <s-box borderRadius="large" overflow="hidden" border="base">
        <s-table>
          <s-table-header-row>
            <s-table-header>Nombre</s-table-header>
            <s-table-header>Código de oficina</s-table-header>
            <s-table-header>Activo</s-table-header>
            <s-table-header>Dirección</s-table-header>
            <s-table-header>Ciudad</s-table-header>
            <s-table-header>Teléfono</s-table-header>
            <s-table-header></s-table-header>
          </s-table-header-row>

          <s-table-body>
            {senders.length && (
              senders.map((sender: SenderWithRelations) => (
                <s-table-row key={sender.id}>
                  <s-table-cell>
                    <s-clickable href={`/app/senders/${sender.id}`} padding="small small-400" borderRadius="small">
                      {sender.locationName || '-'}
                    </s-clickable>
                  </s-table-cell>
                  <s-table-cell>{sender.officeCode || '-'}</s-table-cell>
                  <s-table-cell>
                    <s-badge tone={sender.active ? "success" : "critical"}>
                      {sender.active ? "Activo" : "No activo"}
                    </s-badge>
                  </s-table-cell>
                  <s-table-cell>{sender.locationAddress1 || '-'}</s-table-cell>
                  <s-table-cell>{sender.locationCity || '-'}</s-table-cell>
                  <s-table-cell>{sender.locationPhone || '-'}</s-table-cell>
                  <s-table-cell>
                    <s-grid gridTemplateColumns="auto auto" justifyContent="end" gap="small-300">
                      <s-button icon="edit" variant="primary" href={`/app/senders/${sender.id}`}></s-button>
                      
                      <Form method="post" id={`delete-form-${sender.id}`} style={{ display: 'inline' }}>
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="senderId" value={sender.id} />
                        <s-button 
                          icon="delete" 
                          variant="primary" 
                          tone="critical"
                          type="button"
                          onClick={() => handleDeleteClick(sender.id)}
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
  );
}
