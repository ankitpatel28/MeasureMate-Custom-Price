import { data } from "react-router";
import { authenticate } from "../shopify.server";
import { getProductPricingConfig } from "../models/product-pricing.server";
import {
  calculatePrice,
  normalizeVariantGid,
  validateMeasurementInput,
} from "../models/measurement-pricing.server";

const DRAFT_ORDER_CREATE_MUTATION = `#graphql
  mutation draftOrderCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
        invoiceUrl
        name
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function action({ request }) {
  const { session, admin } = await authenticate.public.appProxy(request);
  const body = await request.json();

  const {
    productId,
    variantId,
    width,
    height,
    depth,
    cropData,
    email,
    quantity,
  } = body || {};

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

  const validationError = validateMeasurementInput({
    rule: config.rule,
    cropRequired: config.cropRequired,
    width,
    height,
    depth,
    cropData,
  });

  if (validationError) {
    return data({ ok: false, error: validationError }, { status: 400 });
  }

  const calculated = calculatePrice(config.rule, width, height, depth);
  const variantGid = normalizeVariantGid(config.baseVariantId || variantId);

  if (!variantGid) {
    return data({ ok: false, error: "Base variant is missing" }, { status: 400 });
  }

  const customAttributes = [
    { key: "Width", value: String(width) },
    { key: "Height", value: String(height) },
    { key: "Depth", value: String(depth || "") },
    { key: "Unit", value: String(config.rule.unit || "") },
    { key: "Area", value: String(calculated.area) },
    { key: "Volume", value: String(calculated.volume) },
    { key: "CalculatedPrice", value: String(calculated.price) },
    { key: "App", value: "measurement-pricer" },
  ];

  if (cropData) {
    customAttributes.push({
      key: "CropData",
      value: JSON.stringify(cropData),
    });
  }

  const variables = {
    input: {
      email: email || undefined,
      tags: ["measurement-pricer", "custom-size"],
      note: "Measurement pricer custom checkout",
      lineItems: [
        {
          variantId: variantGid,
          quantity: Number(quantity || 1),
          customAttributes,
          priceOverride: {
            amount: String(calculated.price),
            currencyCode: config.rule.currencyCode || "USD",
          },
        },
      ],
    },
  };

  const response = await admin.graphql(DRAFT_ORDER_CREATE_MUTATION, { variables });
  const result = await response.json();

  const payload = result?.data?.draftOrderCreate;
  const userErrors = payload?.userErrors || [];

  if (userErrors.length) {
    return data(
      {
        ok: false,
        error: userErrors.map((item) => item.message).join(", "),
      },
      { status: 400 },
    );
  }

  const draftOrder = payload?.draftOrder;

  if (!draftOrder?.invoiceUrl) {
    return data(
      { ok: false, error: "Draft order created but invoice URL is missing" },
      { status: 500 },
    );
  }

  return data({
    ok: true,
    invoiceUrl: draftOrder.invoiceUrl,
    draftOrderId: draftOrder.id,
    calculated,
  });
}
