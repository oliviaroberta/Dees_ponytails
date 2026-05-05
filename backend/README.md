# Backend Scaffold

This backend is scaffolded for the Dees_ponytails store using:

- `Express`
- `TypeScript`
- `Sequelize`
- `PostgreSQL`

## Planned modules

- Admin authentication
- Products
- Orders
- Sales campaigns
- Site content
- Reviews

## First run

1. Copy `.env.example` to `.env`
2. Install dependencies
3. Sync the database tables
4. Seed the database
5. Run the server

Example:

```powershell
cd backend
npm install
npm run db:sync
npm run db:seed
npm run dev
```

## Seeded data

The seed script creates:

- one default admin from `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- homepage site content
- four starter products
- three approved sample reviews

## Main endpoints

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/sales`
- `GET /api/sales/active`
- `POST /api/sales`
- `GET /api/site-content`
- `PUT /api/site-content`
- `GET /api/reviews`
- `POST /api/reviews`
- `PATCH /api/reviews/:id/status`
- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders`
- `PATCH /api/orders/:id/status`

## Auth

Admin-protected write routes require:

```http
Authorization: Bearer <access_token>
```

## Notes

- The frontend currently uses `localStorage`
- The next step is connecting the frontend admin and storefront to these API endpoints
- Payment integration should be added after products, orders, and admin auth are working
