-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProductPricing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "baseVariantId" TEXT NOT NULL,
    "pricingRuleId" TEXT NOT NULL,
    "cropRequired" BOOLEAN NOT NULL DEFAULT false,
    "surchargeVariantId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductPricing_pricingRuleId_fkey" FOREIGN KEY ("pricingRuleId") REFERENCES "PricingRule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProductPricing" ("baseVariantId", "createdAt", "cropRequired", "id", "pricingRuleId", "productId", "shop", "surchargeVariantId", "updatedAt") SELECT "baseVariantId", "createdAt", "cropRequired", "id", "pricingRuleId", "productId", "shop", "surchargeVariantId", "updatedAt" FROM "ProductPricing";
DROP TABLE "ProductPricing";
ALTER TABLE "new_ProductPricing" RENAME TO "ProductPricing";
CREATE UNIQUE INDEX "ProductPricing_shop_productId_key" ON "ProductPricing"("shop", "productId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
