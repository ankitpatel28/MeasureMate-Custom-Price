import { Form, useActionData, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import {
  deletePricingRule,
  listPricingRules,
  savePricingRule,
} from "../models/pricing-rule.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const rules = await listPricingRules(session.shop);
  return { rules };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    await deletePricingRule({
      shop: session.shop,
      id: String(formData.get("id")),
    });
    return { ok: true, message: "Rule deleted" };
  }

  const payload = {
    id: formData.get("id") || "",
    name: formData.get("name"),
    enabled: formData.get("enabled") === "on",
    unit: formData.get("unit"),
    formulaType: formData.get("formulaType"),
    basePrice: formData.get("basePrice"),
    areaRate: formData.get("areaRate"),
    depthRate: formData.get("depthRate"),
    volumeRate: formData.get("volumeRate"),
    minPrice: formData.get("minPrice"),
    maxPrice: formData.get("maxPrice"),
    depthEnabled: formData.get("depthEnabled") === "on",
    cropRequired: formData.get("cropRequired") === "on",
    minWidth: formData.get("minWidth"),
    maxWidth: formData.get("maxWidth"),
    minHeight: formData.get("minHeight"),
    maxHeight: formData.get("maxHeight"),
    minDepth: formData.get("minDepth"),
    maxDepth: formData.get("maxDepth"),
    rounding: formData.get("rounding"),
    currencyCode: formData.get("currencyCode"),
  };

  await savePricingRule({ shop: session.shop, payload });

  return { ok: true, message: "Rule saved" };
};

export default function RulesPage() {
  const { rules } = useLoaderData();
  const actionData = useActionData();

  return (
    <div style={{ padding: 20 }}>
      <s-page heading="Pricing Rules">
        <s-stack gap="base">
          {actionData?.message ? (
            <s-banner tone="success">{actionData.message}</s-banner>
          ) : null}

          <s-card padding="base">
            <Form method="post">
              <s-stack gap="base">
                <s-text-field name="name" label="Rule name" required></s-text-field>

                <s-select name="unit" label="Unit">
                  <s-option value="in">Inches</s-option>
                  <s-option value="cm">Centimeters</s-option>
                  <s-option value="mm">Millimeters</s-option>
                </s-select>

                <s-select name="formulaType" label="Formula type">
                  <s-option value="area">Area</s-option>
                  <s-option value="area_plus_depth">Area + Depth</s-option>
                  <s-option value="volume">Volume</s-option>
                </s-select>

                <s-grid columns="2">
                  <s-text-field name="basePrice" label="Base price" type="number"></s-text-field>
                  <s-text-field name="areaRate" label="Area rate" type="number"></s-text-field>
                  <s-text-field name="depthRate" label="Depth rate" type="number"></s-text-field>
                  <s-text-field name="volumeRate" label="Volume rate" type="number"></s-text-field>
                </s-grid>

                <s-grid columns="2">
                  <s-text-field name="minWidth" label="Min width" type="number"></s-text-field>
                  <s-text-field name="maxWidth" label="Max width" type="number"></s-text-field>
                  <s-text-field name="minHeight" label="Min height" type="number"></s-text-field>
                  <s-text-field name="maxHeight" label="Max height" type="number"></s-text-field>
                  <s-text-field name="minDepth" label="Min depth" type="number"></s-text-field>
                  <s-text-field name="maxDepth" label="Max depth" type="number"></s-text-field>
                </s-grid>

                <s-select name="rounding" label="Rounding" value="nearest_0_01">
                  <s-option value="nearest_0_01">Nearest 0.01</s-option>
                  <s-option value="nearest_0_25">Nearest 0.25</s-option>
                  <s-option value="nearest_0_50">Nearest 0.50</s-option>
                  <s-option value="nearest_1">Nearest 1</s-option>
                </s-select>

                <s-text-field name="currencyCode" label="Currency code" value="USD"></s-text-field>

                <label><input type="checkbox" name="enabled" defaultChecked /> Enabled</label>
                <label><input type="checkbox" name="depthEnabled" /> Enable depth</label>
                <label><input type="checkbox" name="cropRequired" /> Require crop</label>

                <input type="hidden" name="intent" value="save" />
                <s-button type="submit">Save rule</s-button>
              </s-stack>
            </Form>
          </s-card>

          <s-card padding="base">
            <s-heading>Existing rules</s-heading>
            <div style={{ marginTop: 12 }}>
              {rules.length === 0 ? (
                <p>No rules created yet.</p>
              ) : (
                rules.map((rule) => (
                  <div
                    key={rule.id}
                    style={{
                      borderTop: "1px solid #e1e3e5",
                      padding: "12px 0",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 16,
                    }}
                  >
                    <div>
                      <strong>{rule.name}</strong>
                      <div>{rule.formulaType} • {rule.unit} • {rule.currencyCode}</div>
                    </div>

                    <Form method="post">
                      <input type="hidden" name="intent" value="delete" />
                      <input type="hidden" name="id" value={rule.id} />
                      <button type="submit">Delete</button>
                    </Form>
                  </div>
                ))
              )}
            </div>
          </s-card>
        </s-stack>
      </s-page>
    </div>
  );
}
