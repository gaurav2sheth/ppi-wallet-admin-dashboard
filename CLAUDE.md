# PPI Wallet Admin Dashboard

Operations dashboard for admin teams — user management, transaction monitoring, KYC, benefits.

**Part of the PPI Wallet Platform** — see root `CLAUDE.md` for ecosystem overview.

## Tech

React 19 + TypeScript + Vite 8 + Ant Design v5 + Zustand. HashRouter for GitHub Pages.

## Dev Commands

```bash
/usr/local/bin/node ./node_modules/.bin/tsc --noEmit      # type-check
/usr/local/bin/node ./node_modules/.bin/vite build         # production build
/usr/local/bin/node ./node_modules/.bin/gh-pages -d dist   # deploy
```

## Routes

| Route | Page | Permission |
|-------|------|-----------|
| `/login` | LoginPage | — |
| `/` | DashboardPage | All roles |
| `/users` | UsersPage | users.view |
| `/users/:id` | UserDetailPage | users.view |
| `/transactions` | TransactionsPage | transactions.view |
| `/transactions/:id` | TransactionDetailPage | transactions.view |
| `/kyc` | KycPage | kyc.view |
| `/benefits` | BenefitsPage | dashboard.view |
| `/settings` | SettingsPage | settings.view |

## RBAC Roles

| Role | Permissions |
|------|-------------|
| SUPER_ADMIN | All |
| BUSINESS_ADMIN | Dashboard, users (read), transactions (read), analytics, KYC (read) |
| OPS_MANAGER | Dashboard, users, transactions, KYC (approve/reject) |
| CS_AGENT | Dashboard, users (read), transactions (read) |
| COMPLIANCE_OFFICER | Dashboard, users (read), transactions, KYC, analytics |
| MARKETING_MANAGER | Dashboard, analytics |

## Demo Credentials

Demo credentials load from environment variables — see `.env.example`
for the variable names. Three demo roles are wired (Super Admin,
Business Admin, CS Agent); all use hardcoded demo auth with no real
session, no MFA, no rotation. Demo-only pattern. See
`docs/security.md §Auth` on the platform repo for production auth
requirements.

## Key Components

| Component | Purpose |
|-----------|---------|
| `AdminLayout` | Sidebar + content area, collapsible nav |
| `AdminAuthGuard` | Route protection with permission checking |
| `BulkLoadPanel` | Employer bulk-loads sub-wallets (select type, amount, preview, execute) |
| `UtilisationDashboard` | Sub-wallet metrics: loaded, spent, utilisation rate, expiry |
| `AiBenefitsInsight` | Claude-powered utilisation insights and recommendations |

## Data Source

Fetches from Render API (`ppi-wallet-api.onrender.com`) with mock fallback. Vite middleware proxies `/api/sync` for real-time wallet app events in dev mode.
