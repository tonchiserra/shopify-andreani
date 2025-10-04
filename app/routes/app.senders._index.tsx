import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function Index() {
  return (
    <s-stack gap="base" padding="base none">
      <s-stack direction="inline" justifyContent="space-between" alignItems="center">
        <s-heading>Remitentes</s-heading>
        <s-button href="/app/senders/new" variant="primary">Crear Remitente</s-button>
      </s-stack>

      <s-box borderRadius="large" overflow="hidden" border="base">
        <s-table>
          <s-table-header-row>
            <s-table-header>#</s-table-header>
            <s-table-header>Nombre</s-table-header>
            <s-table-header>Email</s-table-header>
            <s-table-header>Teléfono</s-table-header>
            <s-table-header>Dirección</s-table-header>
            <s-table-header>Ciudad</s-table-header>
            <s-table-header></s-table-header>
          </s-table-header-row>

          <s-table-body>
            <s-table-row>
              <s-table-cell>1</s-table-cell>
              <s-table-cell>
                <s-clickable href="/app/senders/1" padding="small small-400" borderRadius="small">Tonchi Test S.A.</s-clickable>
              </s-table-cell>
              <s-table-cell>gonzalo.serra@innovategroup.agency</s-table-cell>
              <s-table-cell>+543476624319</s-table-cell>
              <s-table-cell>9 de Julio 1435</s-table-cell>
              <s-table-cell>Totoras</s-table-cell>
              <s-table-cell>
                <s-grid gridTemplateColumns="auto auto" justifyContent="end" gap="small-300">
                  <s-button icon="edit" variant="primary" href="/app/senders/1"></s-button>
                  <s-button icon="delete" variant="primary" tone="critical"></s-button>
                </s-grid>
              </s-table-cell>
            </s-table-row>

            {/* ... */}
          </s-table-body>
        </s-table>
      </s-box>
    </s-stack>
  );
}
