# Dees_ponytails

Dees_ponytails is a full-stack ponytail extensions store built with:

- `React + Vite + TypeScript` for the storefront and admin dashboard
- `Express + TypeScript + Sequelize + PostgreSQL` for the backend
- `Paystack` payment flow integration

## Project Structure

```text
.
├─ src/        # Frontend app
├─ public/     # Static assets
└─ backend/    # Express API and database layer
```

## Frontend

Main features:

- customer storefront
- product details pages
- cart and checkout
- collections, sales, reviews, and editable homepage sections
- admin dashboard for products, sales, orders, reviews, and settings

### Frontend setup

```powershell
npm install
npm run dev
```

Optional local frontend env:

```env
VITE_API_URL=http://localhost:4000/api
```

## Backend

The backend lives in [`backend/`](./backend/README.md).

### Backend local setup

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run db:sync
npm run db:seed
npm run dev
```

## Deployment

- frontend: `Vercel`
- backend: `Render`
- database: `Render Postgres`

Production frontend env:

```env
VITE_API_URL=https://your-backend-domain/api
```

Production backend env should include:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `FRONTEND_URL`
- `PAYSTACK_SECRET_KEY`
- `PGSSL=true`

## Status

The project is ready for serious end-to-end testing.

Main remaining launch tasks are:

- finish live Paystack account setup
- move uploads to durable cloud storage
- complete final production QA
