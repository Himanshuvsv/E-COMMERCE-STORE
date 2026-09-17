# E-Commerce Store

Express API with PostgreSQL (Sequelize) and MVC modules.

## Environment variables

Add these keys to a `.env` file in the project root:

- `PORT` — server port
- `DATABASE_URL` — PostgreSQL connection string (replaces MongoDB)
- `JWT_SECRET` — secret for signing JWTs and cookies
- `JWT_LIFETIME` — JWT expiry (e.g. `1d`)
- `STRIPE_SECRET_KEY` — Stripe secret key
- `SENDGRID_API_KEY` — SendGrid API key
- `HOST_EMAIL` — sender email for transactional mail
- `ORIGIN` — frontend origin used in password-reset links

## Setup

```bash
npm install
# set DATABASE_URL in .env, then:
npm start
```

Tables are created automatically on startup via Sequelize `sync()`.
