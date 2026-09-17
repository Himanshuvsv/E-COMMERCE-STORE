# E-Commerce Store

Express API with PostgreSQL (Sequelize) and MVC modules.

## Environment variables

Add these keys to a `.env` file in the project root:

- `PORT` — server port
- `DATABASE_URL` — PostgreSQL connection string (replaces MongoDB)
- `JWT_SECRET` — secret for signing JWTs
- `JWT_LIFETIME` — JWT expiry (e.g. `1d`)
- `STRIPE_SECRET_KEY` — Stripe secret key
- `SENDGRID_API_KEY` — SendGrid API key
- `HOST_EMAIL` — sender email for transactional mail
- `ORIGIN` — frontend origin used in password-reset links
- `RUN_CREATE_SCHEMA_DB` — `true` to sync module schemas to the DB on startup; `false` to skip

## Setup

```bash
npm install
# set DATABASE_URL in .env, then:
npm start
```

Table schemas live in each module's `schema.js`. Set `RUN_CREATE_SCHEMA_DB=true` to create/sync tables on startup.
