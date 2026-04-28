import { data } from "react-router";
import { authenticate } from "../shopify.server";
import { getProductPricingConfig } from "../models/product-pricing.server";

export async function loader({ request }) {
  const { session } = await authenticate.public.appProxy(request);
  const url = new URL(request.url);

  const productId = url.searchParams.get("productId");
  const variantId = url.searchParams.get("variantId");

  if (!productId) {
    return data({ ok: false, error: "Missing productId" }, { status: 400 });
  }

  const config = await getProductPricingConfig({
    shop: session.shop,
    productId,
    variantId,
  });

  if (!config) {
    return data({ ok: false, error: "Pricing not configured" }, { status: 404 });
  }

  return data({
    ok: true,
    config: {
      productId: config.productId,
      baseVariantId: config.baseVariantId,
      cropRequired: config.cropRequired,
      surchargeVariantId: config.surchargeVariantId,
      rule: {
        unit: config.rule.unit,
        formulaType: config.rule.formulaType,
        basePrice: config.rule.basePrice,
        areaRate: config.rule.areaRate,
        depthRate: config.rule.depthRate,
        volumeRate: config.rule.volumeRate,
        depthEnabled: config.rule.depthEnabled,
        minWidth: config.rule.minWidth,
        maxWidth: config.rule.maxWidth,
        minHeight: config.rule.minHeight,
        maxHeight: config.rule.maxHeight,
        minDepth: config.rule.minDepth,
        maxDepth: config.rule.maxDepth,
        rounding: config.rule.rounding,
        currencyCode: config.rule.currencyCode,
      },
    },
  });
}
