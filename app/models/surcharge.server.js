export function resolveSurchargeLine({ price, surchargeVariantId }) {
  if (!surchargeVariantId) return null;

  return {
    surchargeVariantId: String(surchargeVariantId),
    surchargeQuantity: 1,
    calculatedPrice: price,
  };
}
