import type { LoaderFunctionArgs } from "react-router"
import { Outlet } from "react-router"
import { authenticate } from "../shopify.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request)
  return null
}

export default function Index() {
  return (
    <s-page heading="Carrier Services" inlineSize="large">
      <s-button slot="primary-action" href="/app/carrier-services/new" variant="primary">Crear Carrier Service</s-button>
      <Outlet />
    </s-page>
  )
}