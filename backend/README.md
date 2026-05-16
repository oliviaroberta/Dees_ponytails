# Dees_ponytails Backend

Backend API for the Dees_ponytails store.

Stack:

- `Express`
- `TypeScript`
- `Sequelize`
- `PostgreSQL`

## Modules

- admin authentication
- products
- orders
- payments
- sales campaigns
- site content
- reviews
- uploads

## Local Setup

1. Copy `.env.example` to `.env`
2. Install dependencies
3. Sync the database
4. Seed starter data
5. Run the server

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run db:sync
npm run db:seed
npm run dev
```

The frontend can run separately from the repo root with `npm run dev`. During local development, the frontend proxies `/api` and `/uploads` to `http://localhost:4000`.

## Environment Variables

Required values:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `FRONTEND_URL`

Optional / deployment-specific:

- `PAYSTACK_SECRET_KEY`
- `PGSSL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_UPLOAD_FOLDER`

## Main Endpoints

### Health

- `GET /api/health`

### Auth

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PATCH /api/auth/me`
- `PATCH /api/auth/change-password`

### Products

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`

### Sales

- `GET /api/sales`
- `GET /api/sales/active`
- `POST /api/sales`

### Site Content

- `GET /api/site-content`
- `PUT /api/site-content`

### Reviews

- `GET /api/reviews`
- `POST /api/reviews`
- `PATCH /api/reviews/:id/status`

### Orders

- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders`
- `PATCH /api/orders/:id/status`

### Payments

- `POST /api/payments/initialize`
- `GET /api/payments/verify/:reference`
- `POST /api/payments/webhook`

### Uploads

- `POST /api/uploads/product-image`
- `POST /api/uploads/product-video`

## Database Scripts

Local:

```powershell
npm run db:sync
npm run db:seed
```

Production build output:

```powershell
npm run db:sync:prod
npm run db:seed:prod
```

## Seeded Data

The seed script creates:

- one default admin from `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- homepage site content
- starter products
- sample reviews

## Notes

- admin-protected routes require `Authorization: Bearer <access_token>`
- payment verification is backend-driven
- uploaded images/videos use Cloudinary when configured
- local filesystem uploads are only a development fallback
- for Vercel deployment, the Express app is exported through the repo-root `api/` function entrypoints and stays mounted under `/api`
