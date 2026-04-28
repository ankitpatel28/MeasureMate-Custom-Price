import db from "../db.server";

export async function listPricingRules(shop) {
  return db.pricingRule.findMany({
    where: {
      shop,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getPricingRuleById({ shop, id }) {
  if (!id) return null;

  return db.pricingRule.findFirst({
    where: {
      id,
      shop,
    },
  });
}

export async function savePricingRule({ shop, payload }) {
  const data = {
    shop,
    name: String(payload.name || "").trim(),
    enabled: Boolean(payload.enabled),
    unit: String(payload.unit || "in"),
    formulaType: String(payload.formulaType || "area_plus_depth"),
    basePrice: Number(payload.basePrice || 0),
    areaRate: Number(payload.areaRate || 0),
    depthRate: Number(payload.depthRate || 0),
    volumeRate: Number(payload.volumeRate || 0),
    depthEnabled: Boolean(payload.depthEnabled),
    minWidth: Number(payload.minWidth || 1),
    maxWidth: Number(payload.maxWidth || 100),
    minHeight: Number(payload.minHeight || 1),
    maxHeight: Number(payload.maxHeight || 100),
    minDepth: Number(payload.minDepth || 0),
    maxDepth: Number(payload.maxDepth || 10),
    rounding: String(payload.rounding || "nearest_0_01"),
    currencyCode: String(payload.currencyCode || "USD"),
  };

  if (payload.id) {
    return db.pricingRule.update({
      where: { id: String(payload.id) },
      data,
    });
  }

  return db.pricingRule.create({ data });
}

export async function deletePricingRule({ shop, id }) {
  return db.pricingRule.updateMany({
    where: {
      id,
      shop,
    },
  });
}
