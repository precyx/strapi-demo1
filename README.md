# ⚙️ Strapi Environment Configuration


## 🌍 Environments

### 🔧 Local
- Environment file: `.env` (or `.env.local`)
- Purpose: Development on your local machine.

### 🚢 Production
- Environment file: `.env.production`
- Purpose: Deployed environment (e.g., Railway).

---

## 🔑 Environment Variables

Below is a breakdown of all environment variables grouped by category.

---

### 🗄️ Database Configuration

| Variable | Example | Description |
|----------|---------|-------------|
| `DATABASE_CLIENT` | `postgres` | Database client type (Postgres, MySQL, SQLite, etc.). |
| `DATABASE_HOST` | `127.0.0.1` | Database server host. |
| `DATABASE_PORT` | `5432` | Port for the database connection. |
| `DATABASE_NAME` | `mydb` | Name of the database to connect to. |
| `DATABASE_USERNAME` | `user123` | Username for the database connection. |
| `DATABASE_PASSWORD` | `password123` | Password for the database connection. |
| `DATABASE_SSL` | `false` | Enables SSL if required by your DB host (e.g., Railway/Heroku often require `true`). |
| `DATABASE_FILENAME` | `data.db` | Used only for SQLite (path to DB file). |
| `DATABASE_URL` | `postgres://user:pass@host:5432/dbname` | Complete connection string (overrides above values in production). |

---

### 🔐 Security & Authentication

| Variable | Example | Description |
|----------|---------|-------------|
| `ADMIN_JWT_SECRET` | `randomSecret` | Secret key used for signing JWT tokens in the Strapi Admin panel. |
| `API_TOKEN_SALT` | `randomSalt` | Salt used when generating API tokens. |
| `APP_KEYS` | `key1,key2,key3` | Array of keys used for signing cookies and sessions. Multiple keys allow rotation. |
| `JWT_SECRET` | `superSecret` | Secret key used for signing JWT tokens for the public API. |
| `TRANSFER_TOKEN_SALT` | `randomSalt` | Salt used when creating transfer tokens (Strapi’s internal security feature). |
| `STRAPI_API_TOKEN` | `token123` | API token for accessing Strapi APIs programmatically. |

---

### 🌐 Server & CORS

| Variable | Example | Description |
|----------|---------|-------------|
| `HOST` | `0.0.0.0` | Defines which network interfaces the app binds to. Use `0.0.0.0` for all. |
| `CORS_ORIGIN` | `https://myfrontend.com` | Allowed origin(s) for frontend requests. Prevents cross-site request issues. |

---

### 💳 Payments (PayPal Integration)

| Variable | Example | Description |
|----------|---------|-------------|
| `PAYPAL_API` | `https://api-m.sandbox.paypal.com` | Base URL for PayPal API (sandbox or live). |
| `PAYPAL_CLIENT_ID` | `abc123` | Client ID for your PayPal app. |
| `PAYPAL_CLIENT_SECRET` | `secret123` | Client secret for your PayPal app. |
| `PAYPAL_MODE` | `sandbox` / `live` | Defines whether the integration uses the testing environment or live payments. |

---

### ☁️ Cloudflare R2 Storage

| Variable | Example | Description |
|----------|---------|-------------|
| `R2_ACCESS_KEY` | `abc123` | Access key for Cloudflare R2 storage. |
| `R2_SECRET_KEY` | `secretKey123` | Secret key for Cloudflare R2. |
| `R2_BUCKET` | `my-bucket` | Name of the R2 storage bucket. |
| `R2_ENDPOINT` | `https://<accountid>.r2.cloudflarestorage.com` | Endpoint for accessing your R2 bucket. |
| `R2_PUBLIC_ACCESS_URL` | `https://cdn.mysite.com` | Public-facing URL for serving uploaded assets. |

---

### 💱 External APIs

| Variable | Example | Description |
|----------|---------|-------------|
| `CURRENCY_API_KEY` | `key123` | API key for currency conversion service (used if app requires exchange rates). |

---

## 🛠️ Technology Stack

- **Strapi** – Headless CMS and backend framework  
- **PostgreSQL** – Database  
- **Railway** – Backend hosting & deployment  
- **Cloudflare R2** – Media and file storage  
- **PayPal API** – Payment integration  
- **Node.js (LTS)** – Runtime environment 


