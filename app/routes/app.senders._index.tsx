import type { LoaderFunctionArgs } from "react-router"
import { useLoaderData } from "react-router"
import { authenticate } from "../shopify.server"
import { senderService } from "app/lib/services/index"

type SenderForTable = {
  id: string;
  docType: string;
  docNum: string;
  officeCode: string;
  location?: {
    name?: string;
    phone?: string;
    address1?: string;
    city?: string;
    active?: boolean;
  };
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request)
  
  const senders = await senderService.getAll(true)
  return { senders }
}

export default function Index() {
  const { senders } = useLoaderData<typeof loader>()

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
            <s-table-header>Teléfono</s-table-header>
            <s-table-header>Dirección</s-table-header>
            <s-table-header>Ciudad</s-table-header>
            <s-table-header></s-table-header>
          </s-table-header-row>

          <s-table-body>
            {senders.length && (
              senders.map((sender: SenderForTable) => (
                <s-table-row key={sender.id}>
                  <s-table-cell>
                    <s-clickable href={`/app/senders/${sender.id}`} padding="small small-400" borderRadius="small">
                      {sender.location?.name || 'Sin nombre'}
                    </s-clickable>
                  </s-table-cell>
                  <s-table-cell>{sender.location?.phone || '-'}</s-table-cell>
                  <s-table-cell>{sender.location?.address1 || '-'}</s-table-cell>
                  <s-table-cell>{sender.location?.city || '-'}</s-table-cell>
                  <s-table-cell>
                    <s-grid gridTemplateColumns="auto auto" justifyContent="end" gap="small-300">
                      <s-button icon="edit" variant="primary" href={`/app/senders/${sender.id}`}></s-button>
                      <s-button icon="delete" variant="primary" tone="critical"></s-button>
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
