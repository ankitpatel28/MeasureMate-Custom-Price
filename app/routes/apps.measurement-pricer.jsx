import { data } from "react-router";
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  const context = await authenticate.public.appProxy(request);
  return data({ ok: true, shop: context.shop });
}
