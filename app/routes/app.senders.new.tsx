import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function Index() {
  return (
    <s-stack gap="base" padding="base none">
      <s-heading>Nuevo Remitente</s-heading>
      
      <form>
        
      </form>
    </s-stack>
  );
}