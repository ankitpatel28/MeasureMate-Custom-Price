import db from "../db.server";

export async function listProductMappings(shop) {
  return db.productPricing.findMany({
    where: { shop },
    include: {
      pricingRule: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function saveProductMapping({ shop, payload }) {
  return db.productPricing.upsert({
    where: {
      shop_productId: {
        shop,
        productId: String(payload.productId),
      },
    },
    update: {
      baseVariantId: String(payload.baseVariantId),
      pricingRuleId: String(payload.pricingRuleId),
      surchargeVariantId: payload.surchargeVariantId
        ? String(payload.surchargeVariantId)
        : null,
      cropRequired: Boolean(payload.cropRequired ?? false),
    },
    create: {
      shop,
      productId: String(payload.productId),
      baseVariantId: String(payload.baseVariantId),
      pricingRuleId: String(payload.pricingRuleId),
      surchargeVariantId: payload.surchargeVariantId
        ? String(payload.surchargeVariantId)
        : null,
      cropRequired: Boolean(payload.cropRequired ?? false),
    },
  });
}

export async function deleteProductMapping({ shop, id }) {
  return db.productPricing.deleteMany({
    where: {
      id,
      shop,
    },
  });
}
