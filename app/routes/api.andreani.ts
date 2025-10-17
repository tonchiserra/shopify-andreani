import type { LoaderFunctionArgs } from "react-router"

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const body = request.body

    console.log("Body:", body)

    return Response.json({ message: "Hello API" });
}