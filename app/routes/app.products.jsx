import { Form, useActionData, useLoaderData } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { authenticate } from "../shopify.server";
import { listPricingRules } from "../models/pricing-rule.server";
import {
  deleteProductMapping,
  listProductMappings,
  saveProductMapping,
} from "../models/product-mapping.server";

async function fetchAllActiveProducts(admin) {
  let products = [];
  let cursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const response = await admin.graphql(
      `
        query ProductList($cursor: String) {
          products(
            first: 100
            after: $cursor
            query: "status:active"
            sortKey: TITLE
            reverse: false
          ) {
            nodes {
              id
              title
              status
              variants(first: 100) {
                nodes {
                  id
                  title
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `,
      { variables: { cursor } }
    );

    const result = await response.json();
    const connection = result?.data?.products;

    if (!connection) break;

    products = products.concat(connection.nodes || []);
    hasNextPage = connection.pageInfo?.hasNextPage || false;
    cursor = connection.pageInfo?.endCursor || null;
  }

  return products;
}

export const loader = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);

  const [rules, mappings, products] = await Promise.all([
    listPricingRules(session.shop),
    listProductMappings(session.shop),
    fetchAllActiveProducts(admin),
  ]);

  return {
    rules,
    mappings,
    products,
  };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    await deleteProductMapping({
      shop: session.shop,
      id: String(formData.get("id")),
    });
    return { ok: true, message: "Mapping deleted" };
  }

  const payload = {
    productId: formData.get("productId"),
    baseVariantId: formData.get("baseVariantId"),
    pricingRuleId: formData.get("pricingRuleId"),
    surchargeVariantId: formData.get("surchargeVariantId") || "",
  };

  await saveProductMapping({ shop: session.shop, payload });

  return { ok: true, message: "Mapping saved" };
};

export default function ProductsPage() {
  const { products, rules, mappings } = useLoaderData();
  const actionData = useActionData();

  const [selectedProductId, setSelectedProductId] = useState("");
  const [baseVariantId, setBaseVariantId] = useState("");

  const selectedProduct = useMemo(() => {
    return products.find((product) => product.id === selectedProductId) || null;
  }, [products, selectedProductId]);

  const selectedProductVariants = selectedProduct?.variants?.nodes || [];

  useEffect(() => {
    if (!selectedProduct) {
      setBaseVariantId("");
      return;
    }

    if (selectedProductVariants.length > 0) {
      setBaseVariantId(selectedProductVariants[0].id);
    } else {
      setBaseVariantId("");
    }
  }, [selectedProductId]);

  return (
    <div style={{ padding: 20 }}>
      <s-page heading="Product Mappings">
        <s-stack gap="base">
          {actionData?.message ? (
            <s-banner tone="success">{actionData.message}</s-banner>
          ) : null}

          <s-card padding="base">
            <Form method="post">
              <s-stack gap="base">
                <label>
                  Product
                  <select
                    name="productId"
                    required
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    style={{ display: "block", width: "100%", minHeight: 40 }}
                  >
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Base variant ID
                  <select
                    name="baseVariantId"
                    required
                    value={baseVariantId}
                    onChange={(e) => setBaseVariantId(e.target.value)}
                    disabled={!selectedProductId || selectedProductVariants.length === 0}
                    style={{ display: "block", width: "100%", minHeight: 40 }}
                  >
                    {!selectedProductId ? (
                      <option value="">Select product first</option>
                    ) : selectedProductVariants.length === 0 ? (
                      <option value="">No variants found</option>
                    ) : (
                      selectedProductVariants.map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {variant.title === "Default Title"
                            ? `${selectedProduct.title} — Default variant`
                            : variant.title}
                        </option>
                      ))
                    )}
                  </select>
                </label>

                <label>
                  Pricing rule
                  <select
                    name="pricingRuleId"
                    required
                    style={{ display: "block", width: "100%", minHeight: 40 }}
                  >
                    <option value="">Select pricing rule</option>
                    {rules.map((rule) => (
                      <option key={rule.id} value={rule.id}>
                        {rule.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Surcharge variant ID
                  <input
                    name="surchargeVariantId"
                    type="text"
                    placeholder="Optional hidden surcharge variant GID"
                    style={{ display: "block", width: "100%", minHeight: 40 }}
                  />
                </label>

                <input type="hidden" name="intent" value="save" />
                <button type="submit">Save mapping</button>
              </s-stack>
            </Form>
          </s-card>

          <s-card padding="base">
            <s-heading>Existing mappings</s-heading>
            <div style={{ marginTop: 12 }}>
              {mappings.length === 0 ? (
                <p>No product mappings yet.</p>
              ) : (
                mappings.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      borderTop: "1px solid #e1e3e5",
                      padding: "12px 0",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 16,
                    }}
                  >
                    <div>
                      <strong>{item.productId}</strong>
                      <div>Rule: {item.pricingRule?.name || item.pricingRuleId}</div>
                      <div>Base variant: {item.baseVariantId}</div>
                    </div>

                    <Form method="post">
                      <input type="hidden" name="intent" value="delete" />
                      <input type="hidden" name="id" value={item.id} />
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
