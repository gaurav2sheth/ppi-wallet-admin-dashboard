# PPI Wallet Admin Dashboard

A desktop-first React admin dashboard for operating an RBI-regulated PPI Wallet, built with **React 19 + TypeScript + Vite + Ant Design v5**.

**Live Demo:** [gaurav2sheth.github.io/ppi-wallet-admin](https://gaurav2sheth.github.io/ppi-wallet-admin)

## Features

- **Dashboard** — KPI metric cards (Total Users, Active Wallets, Aggregate Balance, Today's Transactions)
- **User Management** — Searchable/filterable user table, detailed user profile with KYC/transaction/spend history
- **Transaction Monitoring** — Filterable by type and status, transaction detail with saga step timeline
- **KYC Management** — KYC tier distribution, verification queue, approve/reject actions
- **Benefits Management** — Sub-wallet bulk loading, utilisation dashboard, AI-powered insights
- **Settings** — Role management, system configuration
- **RBAC** — 6 roles (Super Admin, Business Admin, Ops Manager, CS Agent, Compliance Officer, Marketing Manager)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Bundler | Vite 8 |
| UI Library | Ant Design v5 with Paytm theme tokens |
| Routing | React Router v7 (HashRouter) |
| State | Zustand (6 stores) |
| HTTP | Axios |
| Backend | Render Express API — falls back to built-in mock data |

## Getting Started

```bash
npm install
npm run dev
```

The dashboard runs at `http://localhost:5174` with **built-in mock data**.

### Mock Credentials

| Role | Username | Password |
|------|----------|----------|
| Super Admin | admin | admin123 |
| Business Admin | business | admin123 |
| CS Agent | support | admin123 |

## License

MIT
