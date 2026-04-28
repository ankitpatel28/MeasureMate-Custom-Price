import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);

  const [rulesCount, mappingsCount] = await Promise.all([
    db.pricingRule.count({
      where: { shop: session.shop },
    }),
    db.productPricing.count({
      where: { shop: session.shop },
    }),
  ]);

  const response = await admin.graphql(`
    query {
      shop {
        name
      }
    }
  `);

  const result = await response.json();

  return {
    shopName: result?.data?.shop?.name || "Shop",
    rulesCount,
    mappingsCount,
  };
};

export default function DashboardPage() {
  const { shopName, rulesCount, mappingsCount } = useLoaderData();

  return (
    <div style={{ padding: 20 }}>
      <s-page heading="Measurement Pricer">
        <s-stack gap="base">
          <s-banner tone="success">
            Installed on {shopName}
          </s-banner>

          <s-grid columns="2">
            <s-card padding="base">
              <s-heading>Pricing rules</s-heading>
              <p>{rulesCount}</p>
            </s-card>

            <s-card padding="base">
              <s-heading>Product mappings</s-heading>
              <p>{mappingsCount}</p>
            </s-card>
          </s-grid>

          <s-card padding="base">
            <s-heading>Getting started</s-heading>
            <p>Create a pricing rule first, then assign it to products.</p>
          </s-card>
        </s-stack>
      </s-page>
    </div>
  );
}
