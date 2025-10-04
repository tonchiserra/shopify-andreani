import type { LoaderFunctionArgs } from "react-router";
import { useParams } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function Index() {
  const { id } = useParams();
  
  return (
    <s-section heading={`Remitente #${id}`}>
      
    </s-section>
  );
}
