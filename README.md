# 💸 SpendWise AI
 
> AI-powered personal finance dashboard — track expenses, get smart insights, and understand your money.

---

## ✨ Features
 
- **Google OAuth Login** — one-click sign-in via NextAuth.js, user profile persisted to Neon DB
- **Real User Profile** — Google name, email, and avatar displayed live in the sidebar and header
- **AI-Powered Insights** — dynamic financial recommendations based on your savings rate, expense ratio, and rent burden
- **Interactive Dashboard** — KPI cards (Balance, Income, Expenses, Savings), area trend chart, and expense donut chart
- **Transaction Ledger** — add, search, filter, and delete transactions; all data stored per-user in Neon DB
- **Fully Responsive** — collapsible mobile sidebar drawer, stacked layouts, mobile card list view
- **Serverless-ready** — Neon DB with pooled + direct connection strings, Prisma singleton for Next.js hot-reload safety
---
 
## 🖥️ Screenshots
 
| Login Page | Dashboard |
|---|---|
| Orange gradient left panel with feature cards and stats | Full dashboard with KPIs, trend chart, AI insights, and transaction table |
 
---
 
## 🛠️ Tech Stack
 
| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) — App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | [NextAuth.js v5](https://next-auth.js.org) + Google OAuth |
| ORM | [Prisma 7](https://www.prisma.io) |
| Database | [Neon](https://neon.tech) — serverless PostgreSQL |
| Charts | Custom SVG (no external chart library) |
 
---

## 🧠 AI Insights Logic
 
Insights are computed client-side from the user's transaction data — no external AI API needed. Three rules run on every render:
 
| Insight | Trigger |
|---|---|
| ⚠️ No Savings Configured | Savings rate = 0% |
| ⚠️ Boost Your Savings | Savings rate < 12% |
| ✅ Excellent Savings Pace | Savings rate ≥ 12% |
| ⚠️ Deficit Spending Alert | Expenses > Income |
| ⚠️ High Budget Utilisation | Expense ratio > 70% |
| ✅ Healthy Expense Buffer | Expense ratio ≤ 40% |
| ⚠️ Rent-to-Income Overhead | Rent category > 35% of income |
 
---

## 👨‍💻 Authors
 
Made with ❤️ by
 
- **Abhijeet Anand** — [LinkedIn](https://www.linkedin.com/in/abhijeet-anand-87149a33a/)
- **Ankit Pandey** — [LinkedIn](https://www.linkedin.com/in/ankit-pandey0304)