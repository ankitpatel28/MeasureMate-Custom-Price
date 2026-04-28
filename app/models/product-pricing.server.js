import db from "../db.server";

function normalizeProductGid(productId) {
  if (!productId) return null;

  const value = String(productId).trim();

  if (value.startsWith("gid://shopify/Product/")) {
    return value;
  }

  if (/^\d+$/.test(value)) {
    return `gid://shopify/Product/${value}`;
  }

  return value;
}

function normalizeVariantGid(variantId) {
  if (!variantId) return null;

  const value = String(variantId).trim();

  if (value.startsWith("gid://shopify/ProductVariant/")) {
    return value;
  }

  if (/^\d+$/.test(value)) {
    return `gid://shopify/ProductVariant/${value}`;
  }

  return value;
}

export async function getProductPricingConfig({ shop, productId, variantId }) {
  const normalizedProductId = normalizeProductGid(productId);
  const normalizedVariantId = normalizeVariantGid(variantId);

  const productPricing = await db.productPricing.findFirst({
    where: {
      shop: String(shop).trim(),
      productId: normalizedProductId,
    },
  });

  if (!productPricing) {
    return null;
  }

  const rule = await db.pricingRule.findFirst({
    where: {
      id: productPricing.pricingRuleId,
      shop: String(shop).trim(),
      enabled: true,
    },
  });

  if (!rule) {
    return null;
  }

  return {
    productId: productPricing.productId,
    baseVariantId: productPricing.baseVariantId || normalizedVariantId || "",
    surchargeVariantId: productPricing.surchargeVariantId || null,
    cropRequired: productPricing.cropRequired,
    rule,
  };
}
