# 📐 MeasureMate — Custom Price Calculator for Shopify

> **Sell custom-sized products with confidence.** MeasureMate automatically calculates prices based on customer-entered measurements — width, height, and depth — and passes the correct amount securely into Shopify checkout.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Pricing Formulas](#-pricing-formulas)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [How It Works](#-how-it-works)
- [Storefront Widget API](#-storefront-widget-api)
- [Security](#-security)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Support](#-support)

---

## 🔍 Overview

**MeasureMate** is a Shopify embedded app built for merchants who sell products requiring custom measurements — such as curtains, blinds, glass panels, tiles, flooring, signage, or any made-to-measure items.

Instead of requiring separate SKUs for every possible size, MeasureMate lets customers enter their desired dimensions directly on the product page. The app instantly calculates a price using merchant-defined formulas, validates the input server-side, and creates a secure checkout flow with the correct custom amount.

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 📏 **Measurement Input** | Collects width, height, and optional depth from customers on the storefront |
| 💰 **Dynamic Pricing** | Calculates price in real-time as the customer types their dimensions |
| 🧮 **Multiple Formulas** | Area, Area + Depth, and Volume pricing models |
| ✂️ **Crop Support** | Optional crop requirement step before checkout |
| ⚙️ **Merchant Config** | Admin interface for pricing rules, units, rounding, and min/max constraints |
| 🔒 **Server-Side Validation** | All pricing is recalculated and verified on the backend before checkout |
| 🛒 **Secure Checkout** | Shopify-native checkout handoff via backend order creation — no unsafe browser-side Admin API calls |
| 📐 **Unit Flexibility** | Support for cm, mm, inches, and other measurement units |

---

## 🧮 Pricing Formulas

MeasureMate supports three calculation models:

### 1. Area Pricing
```
Final Price = Base Price + (Width × Height × Area Rate)
```

### 2. Area + Depth Pricing
```
Final Price = Base Price + (Width × Height × Area Rate) + (Depth × Depth Rate)
```

### 3. Volume Pricing
```
Final Price = Base Price + (Width × Height × Depth × Volume Rate)
```

All formulas support configurable **rounding**, **minimum price floors**, and **maximum constraints**.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **App Framework** | [Shopify CLI + React Router Template](https://shopify.dev/docs/apps/getting-started/create) |
| **Frontend (Admin)** | React + TypeScript |
| **Storefront UI** | Theme App Extension (JavaScript + Liquid) |
| **Backend** | Shopify App Server (Node.js) |
| **API** | Shopify Admin GraphQL API |
| **Database** | Prisma ORM |
| **Styling** | CSS |
| **Containerization** | Docker |
| **Linting/Formatting** | ESLint + Prettier |
| **Build Tool** | Vite |

---

## 📁 Project Structure

```
MeasureMate-Custom-Price/
├── app/                        # Remix/React Router app — admin UI & backend routes
│   ├── routes/                 # App routes (admin pages, API endpoints, app proxy)
│   ├── components/             # Reusable React components
│   └── shopify.server.ts       # Shopify auth & session handling
├── extensions/                 # Shopify theme app extension
│   └── measuremate-widget/     # Storefront measurement input widget
│       ├── assets/             # Widget JavaScript logic
│       └── blocks/             # Liquid theme blocks
├── prisma/                     # Database schema & migrations
│   └── schema.prisma
├── public/                     # Static assets
├── shopify.app.toml            # App configuration
├── shopify.web.toml            # Web configuration
├── Dockerfile                  # Container setup
├── package.json
└── README.md
```

---

## ✅ Prerequisites

Before getting started, make sure you have:

- [Node.js](https://nodejs.org/) v18 or higher
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli) v3+
- A [Shopify Partner account](https://partners.shopify.com/)
- A Shopify development store
- npm or yarn

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ankitpatel28/MeasureMate-Custom-Price.git
cd MeasureMate-Custom-Price
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up the database

```bash
npx prisma migrate dev
```

### 4. Start the development server

```bash
npm run dev
```

This will use Shopify CLI to:
- Authenticate with your Partner account
- Create a tunnel to your local server
- Launch the app on your development store

### 5. Add the app block to your theme

1. Go to your Shopify Admin → **Online Store → Themes**
2. Click **Customize** on your active theme
3. Navigate to a product page template
4. Add the **MeasureMate Widget** app block
5. Save your theme

---

## ⚙️ Configuration

Once the app is installed, configure your pricing rules from the **App Admin**:

1. **Select a Product** — choose which products use custom pricing
2. **Set Formula Type** — Area, Area + Depth, or Volume
3. **Define Rates** — enter base price, area rate, and depth/volume rates
4. **Set Units** — choose measurement units (cm, mm, inches, etc.)
5. **Configure Constraints** — set min/max dimensions and min price floor
6. **Enable Rounding** — choose rounding strategy (none, up, nearest)
7. **Crop Requirement** — optionally require crop data before checkout

---

## 🔄 How It Works

```
Customer enters measurements on storefront
          ↓
Widget calculates live price estimate
          ↓
Customer clicks "Add to Cart" / "Buy Now"
          ↓
App Proxy sends measurement data to backend
          ↓
Backend validates input against merchant rules
          ↓
Backend recalculates final price (server-side)
          ↓
Backend creates secure checkout via Admin API
          ↓
Customer is redirected to Shopify checkout
with the correct custom price
```

---

## 🧩 Storefront Widget API

The widget exposes a global JavaScript API for integration with external tools (e.g., image croppers):

```javascript
// Set crop data from an external cropper integration
window.MeasurementPricer.setCropData({
  x: 10,
  y: 20,
  width: 300,
  height: 200
});

// Get current measurement values
const measurements = window.MeasurementPricer.getMeasurements();
// Returns: { width, height, depth, unit, estimatedPrice }
```

The widget also dispatches custom DOM events you can listen to:

```javascript
document.addEventListener('measuremate:price-updated', (e) => {
  console.log('New estimated price:', e.detail.price);
});
```

---

## 🔒 Security

MeasureMate is built with Shopify's security best practices:

- **No Admin API access from the browser** — All Admin API calls (e.g., draft order creation) happen exclusively on the app's backend server, never in client-side JavaScript.
- **Server-side price recalculation** — The final price is always recalculated on the server before checkout is created, preventing price manipulation via browser dev tools.
- **App Proxy validation** — Storefront-to-backend communication goes through Shopify's authenticated App Proxy, ensuring request integrity.
- **Session-based auth** — Admin access uses Shopify's OAuth session flow managed by `@shopify/shopify-app-remix`.

---

## 🐳 Deployment

### Using Docker

```bash
# Build the image
docker build -t measuremate-custom-price .

# Run the container
docker run -p 3000:3000 \
  -e SHOPIFY_API_KEY=your_api_key \
  -e SHOPIFY_API_SECRET=your_api_secret \
  -e SCOPES=write_products,write_draft_orders \
  -e HOST=https://your-app-domain.com \
  measuremate-custom-price
```

### Environment Variables

| Variable | Description |
|---------|-------------|
| `SHOPIFY_API_KEY` | Your app's API key from the Partner Dashboard |
| `SHOPIFY_API_SECRET` | Your app's API secret |
| `SCOPES` | Required Shopify API scopes |
| `HOST` | Your app's public URL |
| `DATABASE_URL` | Prisma database connection string |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please make sure your code follows the existing ESLint + Prettier configuration.

---

## 📋 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a history of changes.

---

## 📬 Support

Have a question or found a bug?

- 🌐 **Website**: [ankitdevhub.info](https://ankitdevhub.info/)
- 📧 **Email**: [ankitjpatel28@gmail.com](mailto:ankitjpatel28@gmail.com)
- 🐙 **GitHub**: [@ankitpatel28](https://github.com/ankitpatel28)
- 🐛 **Issues**: [Open an issue](https://github.com/ankitpatel28/MeasureMate-Custom-Price/issues)

---

## ⭐ Rate & Support This Project

If MeasureMate has been useful to you, please consider showing your support:

- ⭐ **Star this repo** — it helps others discover the project
- 🍴 **Fork it** — build something great on top of it
- 🐛 **Report bugs** — help make it better for everyone
- 💬 **Share feedback** — open a [Discussion](https://github.com/ankitpatel28/MeasureMate-Custom-Price/discussions) or reach out via the website



---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">Made with ❤️ for Shopify merchants who sell custom-sized products</p>
<p align="center"><a href="https://ankitdevhub.info/">ankitdevhub.info</a></p>
