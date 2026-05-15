# 🏪 Stax Store Management System

> An enterprise-grade Store Management System built with the MERN stack —
> featuring a full POS engine, real-time analytics, expiry tracking,
> and an optional Electron desktop wrapper.

---

## 🔗 Live Demo

| | |
|---|---|
| **Live URL** | http://13.60.215.119 |
| **Email** | admin@staxstore.com |
| **Password** | stax123 |
| **Role** | Admin (full access) |

---

## ✨ Features

| Module | Description |
|---|---|
| 🔐 **Authentication & RBAC** | Secure login with distinct roles — Admin, Manager, Cashier |
| 🛒 **Advanced POS System** | Add items to cart, compute taxes, checkout via Cash, Card, or Bank Transfer |
| 📦 **Inventory Management** | Full CRUD, automated stock deduction, low stock alerts, expiry warnings |
| 🚚 **Supplier Linking** | Manage suppliers and link them dynamically to inventory items for easy reordering |
| 💸 **Expense Tracking** | Log operational expenses to maintain accurate net profit calculations |
| 📊 **Financial Analytics & P&L** | Dashboard visualizing Revenue, COGS, Gross Profit, and Net Profit |
| 📈 **Interactive Charts** | Data-driven trends and top-selling product breakdowns using Recharts |
| 🧾 **Printable Receipts** | Auto-generate clean, thermal-printer-ready receipts after every transaction |
| 📤 **Export Capabilities** | Download financial reports instantly to CSV or PDF format |
| 🌙 **Dark Mode** | Integrated Dark/Light mode toggle for cashier visual comfort |

---

## 🛠️ Tech Stack & Rationale

### Frontend
- **React + Vite + Tailwind CSS**
  - React offers incredible component reusability
  - Vite guarantees lightning-fast builds
  - Tailwind ensures a fully responsive, modern design without bloated CSS files

### Backend
- **Node.js + Express**
  - Enables a seamless JavaScript ecosystem across both frontend and backend
  - Faster development and native JSON handling

### Database
- **MongoDB + Mongoose**
  - Document databases are highly flexible for e-commerce data structures
  - Supports nesting items inside a sale and dynamic product attributes naturally

### Authentication
- **JSON Web Tokens (JWT)**
  - Stateless and secure session management

### Desktop Wrapper
- **Electron**
  - Allows the web app to run as a native, offline-capable desktop application

---

## 🧠 Thought Process & Decisions

My primary goal was to build a system that feels like **premium native software**, rather than a standard CRUD web application. I enforced strict separation of concerns — the frontend is purely presentational, and the backend handles all business logic and validation.

- **Automated stock deduction** is handled during sale creation (`POST /sales`) to ensure inventory is never out of sync with revenue
- **Centralized Dashboard** surfaces high-level KPIs, while granular data lives in specialized routes — Inventory, Suppliers, Expenses
- **Electron wrapper** ensures cashiers can operate the system in a distraction-free, full-screen environment without a browser

---

## 🧩 Challenges Faced & Solutions

### 1. 📉 Handling Complex MongoDB Aggregations
**Problem:** Calculating COGS (Cost of Goods Sold) and Net Profit dynamically required mapping through nested arrays of sale items.

**Solution:** Handled the heavy aggregation on the Express server at `/api/reports/dashboard`, formatting the payload so the React frontend only needs to render the finalized numbers — keeping the UI layer clean and fast.

---

### 2. 📷 Barcode Scanner Implementation
**Problem:** Relying purely on a physical scanner proved restrictive for users without hardware.

**Solution:** Integrated `html5-qrcode`, allowing the user's laptop or tablet camera to act as a fallback scanner directly inside the browser — no hardware dependency required.

---

### 3. 🔄 React State Stale Data on Checkout
**Problem:** Initially, processing a sale didn't immediately update inventory stock levels on the frontend.

**Solution:** Chained a `fetchProducts()` re-fetch immediately inside the `try` block of a successful checkout, guaranteeing the UI remains perfectly synced with the database at all times. 




## 🚀 How to Run Locally

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas URI)
- npm

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Redhathack1/stax-store-management-system.git
cd stax-store-management-system
# 2. Install backend dependencies
cd server
npm install
# 3. Install frontend dependencies
cd ../client
npm install

# 4. Set environment variables
# In the server folder — copy .env.example to .env
# Update MONGODB_URI and JWT_SECRET with your values
cp .env.example .env

# 5. Start the backend
cd server
npm run dev


# 6. Start the frontend
cd client
npm run dev

# 7. Optional Run as a Desktop App
cd client
npm run electron:dev


