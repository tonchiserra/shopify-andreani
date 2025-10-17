import type { LoaderFunctionArgs } from "react-router"
import { Outlet } from "react-router"
import { authenticate } from "../shopify.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request)
  return null
}

export default function Index() {
  return (
    <s-page heading="Remitentes" inlineSize="large">
      <s-button slot="primary-action" href="/app/senders/new" variant="primary">Crear Remitente</s-button>
      <Outlet />
    </s-page>
  )
}
