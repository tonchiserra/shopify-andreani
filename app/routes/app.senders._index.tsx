import { useLoaderData, type LoaderFunctionArgs, useActionData } from "react-router"
import { authenticate } from "../shopify.server"
import { useEffect } from "react"
import { senderService } from "app/lib/services/index"
import { showToast } from "app/lib/utils/shopify-apis"
import NoContent from "app/components/noContent"
import SendersTable from "app/components/sendersTable"

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

  return (
    <s-stack gap="base" padding="base none">
      {
        senders.length === 0
        ? <NoContent message="No hay remitentes disponibles. Empieza creando uno nuevo." cta="/app/senders/new" ctaLabel="Crear Remitente" />
        : <SendersTable senders={senders} />
      }
    </s-stack>
  )
}
