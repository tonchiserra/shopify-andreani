import { boundary } from "@shopify/shopify-app-react-router/server";
import { useRouteError } from "react-router";

export default function ErrorBoundary() {
  const error = useRouteError();
  
  return boundary.error(error);
}