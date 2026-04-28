import { data } from "react-router";
import { authenticate } from "../shopify.server";
import { getProductPricingConfig } from "../models/product-pricing.server";
import { calculatePrice } from "../models/pricing.server";
import { resolveSurchargeLine } from "../models/surcharge.server";

export async function action({ request }) {
  const { session } = await authenticate.public.appProxy(request);
  const body = await request.json();

  const productId = String(body.productId || "");
  const variantId = String(body.variantId || "");
  const width = body.width;
  const height = body.height;
  const depth = body.depth || 0;
  const cropData = body.cropData || null;

  if (!productId || !variantId) {
    return data({ ok: false, error: "Missing productId or variantId." }, { status: 400 });
  }

  const config = await getProductPricingConfig({
    shop: session.shop,
    productId,
    variantId,
  });

  if (!config) {
    return json({ ok: false, error: "Pricing is not configured for this product." }, { status: 404 });
  }

  if (config.cropRequired && !cropData) {
    return data({ ok: false, error: "Crop data is required." }, { status: 400 });
  }

  try {
    const calculated = calculatePrice({
      width,
      height,
      depth,
      rule: config.rule,
    });

    const configurationId = crypto.randomUUID();

    const surcharge = resolveSurchargeLine({
      price: calculated.price,
      surchargeVariantId: config.surchargeVariantId,
    });

    return data({
      ok: true,
      configurationId,
      baseVariantId: config.baseVariantId,
      surchargeVariantId: surcharge?.surchargeVariantId || null,
      surchargeQuantity: surcharge?.surchargeQuantity || 1,
      redirectTo: "checkout",
      calculated,
      properties: {
        Width: String(calculated.width),
        Height: String(calculated.height),
        ...(config.rule.depthEnabled ? { Depth: String(calculated.depth) } : {}),
        Unit: config.rule.unit,
        Area: String(calculated.area),
        Volume: String(calculated.volume),
        CalculatedPrice: String(calculated.price),
        ConfigurationId: configurationId,
        _bundleRole: "base",
        _cropData: JSON.stringify(cropData || {}),
      },
    });
  } catch (error) {
    return data(
      {
        ok: false,
        error: error.message || "Validation failed.",
      },
      { status: 400 }
    );
  }
}
