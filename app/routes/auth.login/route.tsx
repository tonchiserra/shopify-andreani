import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { login } from "../../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return redirect(`/?${url.searchParams.toString()}`);
};

export const action = async ({ request }: LoaderFunctionArgs) => {
  const body = await request.formData();
  const shop = body.get("shop");

  if (!shop || typeof shop !== "string") {
    throw new Response("Shop is required", { status: 400 });
  }

  throw await login(request);
};

export default function AuthLogin() {
  return null;
}