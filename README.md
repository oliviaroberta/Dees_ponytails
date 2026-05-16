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
# Optional. Leave unset to use the local /api proxy to backend:4000.
VITE_API_URL=
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
- backend API: `Vercel Functions`
- database: `Neon Postgres`
- media: `Cloudinary`

Production frontend env:

```env
# Optional. Leave unset to use same-origin /api on Vercel.
VITE_API_URL=/api
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

Vercel serves the React frontend and the Express backend together. The API remains available under `/api`, and the backend uses `DATABASE_URL` for Neon Postgres.

## Local Development Notes

- backend still runs locally from `backend/` with `npm run dev`
- frontend now calls `/api` by default
- Vite proxies `/api` and `/uploads` to `http://localhost:4000` during local development
- do not commit real `.env` files or secrets

## Status

The project is ready for serious end-to-end testing.

Main remaining launch tasks are:

- finish live Paystack account setup
- move uploads to durable cloud storage
- complete final production QA
