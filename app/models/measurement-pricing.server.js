export function normalizeProductGid(productId) {
  if (!productId) return null;
  const value = String(productId).trim();
  if (value.startsWith("gid://shopify/Product/")) return value;
  if (/^\d+$/.test(value)) return `gid://shopify/Product/${value}`;
  return value;
}

export function normalizeVariantGid(variantId) {
  if (!variantId) return null;
  const value = String(variantId).trim();
  if (value.startsWith("gid://shopify/ProductVariant/")) return value;
  if (/^\d+$/.test(value)) return `gid://shopify/ProductVariant/${value}`;
  return value;
}

export function roundPrice(value, mode) {
  const n = Number(value || 0);
  if (mode === "nearest_1") return Math.round(n);
  if (mode === "nearest_0_50") return Math.round(n * 2) / 2;
  if (mode === "nearest_0_25") return Math.round(n * 4) / 4;
  return Math.round(n * 100) / 100;
}

export function calculatePrice(rule, width, height, depth) {
  const w = Number(width || 0);
  const h = Number(height || 0);
  const d = Number(depth || 0);

  const area = w * h;
  const volume = area * d;
  let price = Number(rule.basePrice || 0);

  if (rule.formulaType === "area") {
    price += area * Number(rule.areaRate || 0);
  } else if (rule.formulaType === "area_plus_depth") {
    price += area * Number(rule.areaRate || 0);
    if (rule.depthEnabled) {
      price += d * Number(rule.depthRate || 0);
    }
  } else if (rule.formulaType === "volume") {
    price += volume * Number(rule.volumeRate || 0);
  } else {
    price += area * Number(rule.areaRate || 0);
  }

  return {
    area,
    volume,
    price: roundPrice(price, rule.rounding),
  };
}

export function validateMeasurementInput({ rule, cropRequired, width, height, depth, cropData }) {
  const w = Number(width || 0);
  const h = Number(height || 0);
  const d = Number(depth || 0);

  if (!w || !h) return "Width and height are required.";

  if (rule.minWidth != null && w < Number(rule.minWidth)) {
    return `Minimum width is ${rule.minWidth}.`;
  }

  if (rule.maxWidth != null && w > Number(rule.maxWidth)) {
    return `Maximum width is ${rule.maxWidth}.`;
  }

  if (rule.minHeight != null && h < Number(rule.minHeight)) {
    return `Minimum height is ${rule.minHeight}.`;
  }

  if (rule.maxHeight != null && h > Number(rule.maxHeight)) {
    return `Maximum height is ${rule.maxHeight}.`;
  }

  if (rule.depthEnabled) {
    if (rule.minDepth != null && d < Number(rule.minDepth)) {
      return `Minimum depth is ${rule.minDepth}.`;
    }

    if (rule.maxDepth != null && d > Number(rule.maxDepth)) {
      return `Maximum depth is ${rule.maxDepth}.`;
    }
  }

  if (cropRequired && !cropData) {
    return "Please complete image crop before continuing.";
  }

  return null;
}
