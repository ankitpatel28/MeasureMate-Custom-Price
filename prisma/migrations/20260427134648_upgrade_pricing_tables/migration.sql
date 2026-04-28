-- CreateTable
CREATE TABLE "PricingRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "unit" TEXT NOT NULL DEFAULT 'in',
    "formulaType" TEXT NOT NULL DEFAULT 'area_plus_depth',
    "basePrice" REAL NOT NULL DEFAULT 0,
    "areaRate" REAL NOT NULL DEFAULT 0,
    "depthRate" REAL NOT NULL DEFAULT 0,
    "volumeRate" REAL NOT NULL DEFAULT 0,
    "depthEnabled" BOOLEAN NOT NULL DEFAULT false,
    "minWidth" REAL NOT NULL DEFAULT 1,
    "maxWidth" REAL NOT NULL DEFAULT 100,
    "minHeight" REAL NOT NULL DEFAULT 1,
    "maxHeight" REAL NOT NULL DEFAULT 100,
    "minDepth" REAL NOT NULL DEFAULT 0,
    "maxDepth" REAL NOT NULL DEFAULT 10,
    "rounding" TEXT NOT NULL DEFAULT 'nearest_0_01',
    "currencyCode" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProductPricing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "baseVariantId" TEXT NOT NULL,
    "pricingRuleId" TEXT NOT NULL,
    "cropRequired" BOOLEAN NOT NULL DEFAULT false,
    "surchargeVariantId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
