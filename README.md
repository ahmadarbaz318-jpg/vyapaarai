# Vyapaar AI — Smart Business Digital Assistant 🚀

An AI-powered digital assistant that helps small business owners (grocery shops, pharmacies, cafés, clothing stores, stationery shops, hardware stores, and other local retailers) manage inventory, record sales, and get AI-powered business advice — with **no technical knowledge required**.

Built for the **Startup & Entrepreneurship Hackathon**.

---

## ✨ Features

- **Landing page** — hero, feature cards, live stats, testimonials, FAQ
- **JWT Authentication** — register, login, logout with hashed passwords
- **Dashboard** — today's/monthly revenue & profit, 7-day trend chart, low-stock alerts, recent sales
- **Inventory Management** — add/edit/delete products, search, category filter, pagination, low-stock badges
- **Sales / Billing** — cart-based checkout, auto totals & profit calculation, auto invoice numbers, stock deduction
- **Orders** — full sales history with expandable line items, search, pagination
- **Analytics** — daily/weekly/monthly trends, best & worst sellers, revenue by category, inventory value
- **AI Business Advisor** — Gemini-powered chat grounded in your real sales & inventory data (with a smart offline fallback if no API key is set)
- **Settings** — business name, owner name, currency, low-stock threshold, theme
- **Demo data** — 20 realistic products and 30 days of simulated sales, seeded automatically

---

## 🛠️ Tech Stack

**Frontend:** React 18 + Vite, Tailwind CSS, Framer Motion, React Icons, Recharts, React Router, Axios, React Hot Toast
**Backend:** Node.js + Express (MVC architecture)
**Database:** SQLite (via `better-sqlite3`)
**AI:** Google Gemini API (`gemini-1.5-flash`) with graceful rule-based fallback
**Auth:** JWT + bcrypt password hashing

---

## 📁 Project Structure

```
vyapaar-ai/
├── backend/
│   ├── controllers/     # Business logic (auth, products, sales, analytics, ai, settings)
│   ├── routes/          # Express route definitions
│   ├── middleware/      # JWT auth guard + centralized error handling
│   ├── db/               # SQLite schema (init.js) + demo data seeder (seed.js)
│   ├── utils/            # Input validators
│   ├── server.js         # App entry point
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/           # Axios instance with auth interceptor
    │   ├── context/       # AuthContext (global auth state)
    │   ├── components/    # Layout, Sidebar, Topbar, StatCard, Modal, etc.
    │   ├── pages/          # Landing, Login, Register, Dashboard, Inventory, Sales,
    │   │                    Analytics, AIAdvisor, Orders, Settings
    │   ├── App.jsx
    │   └── main.jsx
    └── index.html
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# (Optional) Add your Gemini API key to .env for live AI responses.
# Without a key, the AI Advisor uses a smart rule-based fallback — it still works great for demos.
npm run seed     # populates demo user + 20 products + 30 days of sales
npm run dev      # starts the API on http://localhost:5000
```

**Demo login:** `demo@vyapaar.ai` / `demo1234`

### 2. Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev      # starts the app on http://localhost:5173
```

The Vite dev server proxies all `/api` requests to the backend automatically — no extra configuration needed.

### 3. Open the app

Visit **http://localhost:5173** in your browser. Log in with the demo credentials above, or register a new business account.

---

## 🔑 Environment Variables (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `JWT_SECRET` | Secret used to sign JWTs | *(change in production)* |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `GEMINI_API_KEY` | Google Gemini API key for AI Advisor | *(optional — fallback used if empty)* |
| `GEMINI_MODEL` | Gemini model name | `gemini-1.5-flash` |
| `DB_PATH` | SQLite database file path | `./db/vyapaar.sqlite` |

Get a free Gemini API key at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).

---

## 🗄️ Database Schema

- **users** — business_name, owner_name, email, hashed password, business_type
- **business_settings** — currency, theme, low_stock_threshold (1-to-1 with users)
- **products** — name, category, price, cost, quantity, low_stock_threshold, image
- **sales** — invoice_number, total_amount, total_profit, customer_name, payment_method
- **sale_items** — line items linking sales ↔ products, with quantity/price/cost/profit snapshotted at sale time

All tables use proper foreign keys with `ON DELETE CASCADE`.

---

## 🔒 Security

- Passwords hashed with bcrypt (10 salt rounds)
- JWT-based route protection on every private endpoint
- Parameterized SQL queries throughout (no string-concatenated SQL — prevents injection)
- Server-side input validation on all write endpoints

---

## 📡 API Overview

All endpoints are prefixed with `/api` and (except auth) require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create a new business account |
| POST | `/auth/login` | Log in and receive a JWT |
| GET | `/auth/me` | Get the current user |
| GET/POST/PUT/DELETE | `/products` | Full product CRUD |
| GET | `/products/categories` | Distinct product categories |
| GET/POST | `/sales` | List sales / record a new sale |
| GET | `/analytics/dashboard` | Dashboard summary metrics |
| GET | `/analytics` | Deep analytics (trends, best/worst sellers, categories) |
| POST | `/ai/ask` | Ask the AI Business Advisor a question |
| GET | `/ai/suggested-questions` | Get starter question suggestions |
| GET/PUT | `/settings` | View / update business settings |

---

## 🏆 Built For Hackathon Judges

- Premium Shopify/Stripe-inspired dashboard UI
- Fully responsive (desktop, tablet, mobile)
- Real, working AI integration with graceful degradation
- Clean MVC backend, no code duplication
- Seeded demo data so the app is instantly demo-ready

