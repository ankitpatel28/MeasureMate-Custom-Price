# MeasureMate-Custom-Price

**MeasureMate-Custom-Price** is a Shopify app for merchants who sell custom-sized products and need automatic price calculation based on customer-entered measurements. It supports width, height, and optional depth-based pricing, validates measurement rules, and sends customers into Shopify checkout with the correct calculated amount using a server-side flow. Shopify recommends using the React Router app template created with `shopify app init` for most apps, and line item properties plus server-side validation are standard patterns for custom product configuration flows.[1][2][3]

## Features

- Dynamic pricing based on width, height, and optional depth.[4][5]
- Support for area-based, area-plus-depth, and volume-based formulas.[5][6]
- Live storefront price estimation while the customer enters measurements.[4][7]
- Optional crop requirement before checkout.[7]
- Merchant-configurable pricing rules, units, rounding, and min/max constraints.[8]
- Server-side validation before creating the payable checkout flow.[8][9]
- Shopify-native checkout handoff using backend order creation logic rather than unsafe browser-side Admin API calls.[10][9]

## How it works

1. The merchant configures pricing rules inside the app admin, including formula type, rates, units, rounding, and product-specific settings.[8]
2. The theme app extension renders a measurement widget on the storefront product page.[2][8]
3. The customer enters width, height, and optional depth, and can also provide crop data if required.[7][3]
4. The storefront script requests backend validation through the app proxy before proceeding.[11][9]
5. The backend recalculates the final price and creates the checkout-ready flow securely on the server.[10][9]

## Pricing models supported

- **Area pricing**: Base price + (width × height × area rate)
- **Area + depth pricing**: Base price + (width × height × area rate) + (depth × depth rate)
- **Volume pricing**: Base price + (width × height × depth × volume rate)

## Tech stack

- **Framework**: Shopify app created with `shopify app init` using the React Router template.[1][2]
- **Language**: JavaScript with React for the embedded admin app.[2][8]
- **Storefront UI**: Theme App Extension with JavaScript widget logic.[2]
- **Backend**: Shopify app server routes for config loading, validation, and secure checkout creation.[8][9]
- **API**: Shopify Admin GraphQL API for server-side operations.[8][10]

## Installation

1. Create the app using Shopify CLI with the recommended app template.[1][2]
2. Install the app on your development store.
3. Configure product pricing rules inside the admin interface.[8]
4. Add the app block to the product page through the theme editor.[2]
5. Test measurement input, validation, and checkout redirection on storefront.[3][9]

## Storefront capabilities

The measurement widget can:

- Collect width and height inputs.
- Optionally collect depth.
- Display live estimated price.
- Track area and volume values.
- Accept crop data from an external cropper integration through `window.MeasurementPricer.setCropData(data)`.
- Validate and submit the custom configuration before checkout.

## Security notes

Admin API operations such as draft order creation should be executed on the app backend, not directly in browser JavaScript. Shopify community guidance warns against exposing Admin API access from the storefront because of security and architecture concerns.[9][12]

## Support

- **Email**: [ankitjpatel28@gmail.com](mailto:ankitjpatel28@gmail.com)
- **GitHub**: [https://github.com/ankitpatel28](https://github.com/ankitpatel28)
- **Repository**: [MeasureMate-Custom-Price](https://github.com/ankitpatel28/MeasureMate-Custom-Price)
