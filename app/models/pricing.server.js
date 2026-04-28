export function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function roundPrice(value, mode = "nearest_0_01") {
  const n = Number(value || 0);

  if (mode === "nearest_1") return Math.round(n);
  if (mode === "nearest_0_50") return Math.round(n * 2) / 2;
  if (mode === "nearest_0_25") return Math.round(n * 4) / 4;

  return Math.round(n * 100) / 100;
}

export function validateDimensions({ width, height, depth = 0, rule }) {
  const w = toNumber(width);
  const h = toNumber(height);
  const d = toNumber(depth);

  if (!w || !h) {
    throw new Error("Width and height are required.");
  }

  if (w < rule.minWidth || w > rule.maxWidth) {
    throw new Error(`Width must be between ${rule.minWidth} and ${rule.maxWidth} ${rule.unit}.`);
  }

  if (h < rule.minHeight || h > rule.maxHeight) {
    throw new Error(`Height must be between ${rule.minHeight} and ${rule.maxHeight} ${rule.unit}.`);
  }

  if (rule.depthEnabled && (d < rule.minDepth || d > rule.maxDepth)) {
    throw new Error(`Depth must be between ${rule.minDepth} and ${rule.maxDepth} ${rule.unit}.`);
  }

  return { w, h, d };
}

export function calculatePrice({ width, height, depth = 0, rule }) {
  const { w, h, d } = validateDimensions({ width, height, depth, rule });

  const area = w * h;
  const volume = area * d;
  let price = Number(rule.basePrice || 0);

  if (rule.formulaType === "area") {
    price += area * Number(rule.areaRate || 0);
  } else if (rule.formulaType === "area_plus_depth") {
    price += area * Number(rule.areaRate || 0);
    price += d * Number(rule.depthRate || 0);
  } else if (rule.formulaType === "volume") {
    price += volume * Number(rule.volumeRate || 0);
  } else {
    price += area * Number(rule.areaRate || 0);
  }

  return {
    width: w,
    height: h,
    depth: d,
    area,
    volume,
    price: roundPrice(price, rule.rounding),
  };
}
