# Backend

This is the backend service for the template-driven app.

## Features

- Node.js + TypeScript server
- Express-style API setup
- PostgreSQL integration support
- Environment-based configuration

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in this directory and add your environment variables, for example:

   ```env
    PORT=3000

    DB_HOST=localhost
    DB_PORT=5432
    DB_USER=postgres
    DB_PASSWORD=your_password
    DB_NAME=your_db_name

    JWT_SECRET=your_long_random_generated_code
    JWT_EXPIRES_IN=1d # can be changed
   CORS_ORIGIN=http://localhost:4200
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Project Structure

```bash
Backend/
├── src/
├── index.ts
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md
```

## Scripts

- `npm start` — runs the backend server
- `npm run build` — compiles TypeScript

## Notes

Update the environment variables and database configuration to match your local or deployment setup.

## Tenant routing

Every authentication request must include the active salon slug:

```http
X-Tenant-Slug: joesbarber
```

The backend resolves that value against an active row in `shops`, then scopes every user lookup and insert by the resolved `shop_id`. A user can therefore use the same email address at different salons.

The current database schema stores a `slug`, not a custom domain. For separate custom domains, configure the reverse proxy or frontend host mapping to translate each domain into the corresponding slug and send this header. Do not accept a client-supplied `shop_id`; only the server-resolved shop is trusted.

Public registration creates a `CUSTOMER`. `ADMIN` and `BARBER` accounts should be provisioned by a trusted shop-management flow.
