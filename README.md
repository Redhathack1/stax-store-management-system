# Stax Store Management System

Stax is an enterprise-grade Point of Sale (POS) and inventory management engine. It allows store administrators to process sales, manage stock with expiry alerts, track expenses, and view real-time financial analytics.

## Features List
- **Authentication & RBAC:** Secure login with distinct roles (Admin, Manager, Cashier).
- **Advanced POS System:** Add items to cart, compute taxes, and checkout via Cash, Card, or Bank Transfer.
- **Inventory Management:** Full CRUD operations for products, automated stock deduction, low stock alerts, and expiry warnings.
- **Supplier Linking:** Manage suppliers and dynamically link them to inventory items for easy reordering.
- **Expense Tracking:** Log operational expenses to maintain accurate net profit calculations.
- **Financial Analytics & P&L:** Dashboard visualizing Revenue, COGS, Gross Profit, and Net Profit.
- **Interactive Charts:** Data-driven trends and top-selling product breakdowns using Recharts.
- **Printable Receipts:** Automatically generate clean, thermal-printer-ready receipts after transactions.
- **Export Capabilities:** Instantly download financial reports to CSV or PDF format.
- **Dark Mode:** Integrated Dark/Light mode toggle for cashier visual comfort.

## Tech Stack & Rationale
- **Frontend:** React + Vite + Tailwind CSS. *Reason:* React offers incredible component reusability, Vite guarantees lightning-fast builds, and Tailwind ensures a fully responsive, modern design without bloated CSS files.
- **Backend:** Node.js + Express. *Reason:* Enables a seamless JavaScript ecosystem across both the frontend and backend, resulting in faster development and native JSON handling.
- **Database:** MongoDB + Mongoose. *Reason:* Document databases are highly flexible for e-commerce data structures (like nesting items inside a sale or dynamic product attributes).
- **Authentication:** JSON Web Tokens (JWT). *Reason:* Stateless and secure session management.
- **Desktop Wrapper:** Electron. *Reason:* Allows the web app to run as a native, offline-capable desktop application.

## How to Run Locally

1. **Clone the repository**
2. **Install Dependencies:**
   - In the `server` folder: `npm install`
   - In the `client` folder: `npm install`
3. **Set Environment Variables:**
   - Copy `.env.example` to `.env` in the root (or individually in `server` and `client`) and update the `MONGODB_URI` and `JWT_SECRET`.
4. **Start the Backend:**
   - `cd server && npm run dev`
5. **Start the Frontend:**
   - `cd client && npm run dev`
6. **Start as a Desktop App (Optional):**
   - `cd client && npm run electron:dev`

## Live Demo Link
- **Frontend:** [https://stax-store.vercel.app](https://stax-store.vercel.app) *(Note: Replace with your actual deployed Vercel URL)*
- **Backend API:** [https://stax-api.onrender.com](https://stax-api.onrender.com) *(Note: Replace with your actual deployed Render URL)*

## Thought Process & Decisions
My primary goal was to build a system that feels like **premium native software**, rather than a standard web page. I enforced strict separation of concerns by keeping the frontend purely presentational and the backend strictly for business logic and validation. 
- I chose to implement automated stock deduction during the sale creation (`POST /sales`) to ensure inventory is never out of sync with revenue.
- I structured the application using a centralized Dashboard for high-level KPIs, pushing granular data into specialized routes (Inventory, Suppliers, Expenses). 
- I integrated the Electron wrapper to ensure cashiers can operate the system in a distraction-free, full-screen environment.

## Challenges Faced & Solutions
1. **Handling Complex MongoDB Aggregations:** Calculating COGS (Cost of Goods Sold) and Net Profit dynamically required mapping through nested arrays of sale items. I solved this by handling the heavy aggregation on the Express server (`/api/reports/dashboard`), formatting the payload so the React frontend only needs to render the finalized numbers.
2. **Barcode Scanner Implementation:** Relying purely on a physical scanner proved restrictive for users without hardware. I solved this by integrating `html5-qrcode`, allowing the user's laptop or tablet camera to act as a fallback scanner directly inside the browser.
3. **React State Stale Data on Checkout:** Initially, processing a sale didn't immediately update the inventory stock levels on the frontend. I solved this by chaining a `fetchProducts()` re-fetch immediately inside the `try` block of a successful checkout, guaranteeing the UI remains perfectly synced with the database.
