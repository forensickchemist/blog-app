# BlogApp — Server (API)

Express + MongoDB (Mongoose) REST API for the BlogApp MEVN project. Deployed to **Render**.

## Stack

- **Express 4** — HTTP framework
- **MongoDB / Mongoose** — data store & ODM
- **JWT** (httpOnly cookie + Bearer fallback) — authentication
- **bcryptjs** — password hashing
- **Cloudinary** + **Multer** — image upload/hosting (via a small custom
  Multer storage engine in `config/cloudinary.js` — see note below)
- **express-validator** — request validation
- **helmet / cors / express-rate-limit** — baseline security

## Project structure

```
server/
├─ src/
│  ├─ config/           # db.js, cloudinary.js — env-driven, no app logic
│  ├─ models/           # Mongoose schemas
│  ├─ controllers/      # business logic per resource
│  ├─ routes/           # Express routers, one file per resource
│  ├─ middlewares/      # auth, validation, centralized error handling
│  ├─ utils/            # ApiError, ApiResponse, asyncHandler, seedAdmin
│  ├─ app.js            # Express app assembly (middleware + route mounting)
│  └─ server.js         # entry point — connects DB, starts listener
├─ .env.example
├─ render.yaml           # optional Render Blueprint
└─ package.json
```

Every file has a header comment marking it **REUSABLE CORE** (carry it into
any new MEVN project unchanged) or **APP-SPECIFIC** (this is the piece to
rewrite when you build something other than a blog — see the root README's
"Reusing this skeleton" section for the full explanation).

## Getting started locally

```bash
cd server
cp .env.example .env      # then fill in your own values
npm install
npm run dev                # nodemon, http://localhost:4000
```

Requires Node 18+ and a MongoDB connection string (Atlas free tier works
fine — see root README).

### Seed an admin account (optional)

Set `ADMIN_EMAIL` / `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `.env`, then:

```bash
npm run seed:admin
```

This creates the user if it doesn't exist, or promotes an existing user
with that email to `role: "admin"`.

## A note on Cloudinary uploads

`config/cloudinary.js` implements its own tiny Multer storage engine
against the `cloudinary` v2 SDK, instead of depending on
`multer-storage-cloudinary`. That package's latest release still peer-
depends on `cloudinary@^1.x`, which conflicts with `cloudinary@^2.x` and
breaks `npm install` with an ERESOLVE error. The custom engine produces
the same `req.file.path` / `req.file.filename` shape the controllers
expect, so nothing else in the codebase needed to change. It also means
this project runs on `multer@^2.x` (the 1.x line has known, patched
vulnerabilities) without any extra compatibility shims — the
`_handleFile` / `_removeFile` storage engine interface it relies on is
unchanged between Multer 1.x and 2.x.

## Environment variables

See `.env.example` for the full list and inline comments. Summary:

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Token signing |
| `CLIENT_URL` | Allowed CORS origin (your Vercel URL in production) |
| `CLOUDINARY_*` | Image upload credentials |
| `ADMIN_*` | Used only by `npm run seed:admin` |

## API reference

All responses follow the same envelope:

```json
{ "success": true, "statusCode": 200, "message": "...", "data": { } }
```

Errors follow the same shape with `"success": false` and an optional
`errors` array of `{ field, message }` for validation failures.

### Auth — `/api/auth`

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Create account (`email`, `username`, `password`) |
| POST | `/login` | — | Log in (`emailOrUsername`, `password`) — sets auth cookie |
| POST | `/logout` | — | Clears the auth cookie |
| GET | `/me` | ✅ | Returns the current authenticated user |

### Users — `/api/users`

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/` | ✅ admin | List all users |
| GET | `/:username` | — | Public profile |
| PUT | `/me` | ✅ | Update own `username` / `bio` |
| PUT | `/me/avatar` | ✅ | Upload avatar (`multipart/form-data`, field `avatar`) |

### Posts — `/api/posts`

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/` | — | List posts. Query: `page`, `limit`, `search`, `tag`, `author` |
| GET | `/user/:username` | — | Posts by one author |
| GET | `/:slug` | — | Single post |
| POST | `/` | ✅ | Create post (`multipart/form-data`: `title`, `content`, `tags`, `status`, `coverImage`) |
| PUT | `/:slug` | ✅ owner/admin | Update post |
| DELETE | `/:slug` | ✅ owner/admin | Delete post — **admins can delete any post** |

### Health

`GET /api/health` — uptime check, useful for Render health checks / uptime pings.

## Error handling

All controllers are wrapped in `asyncHandler`, so thrown errors (including
`ApiError` instances) are forwarded to the centralized `error.middleware.js`,
which normalizes Mongoose cast/validation/duplicate-key errors and JWT
errors into consistent JSON responses. Stack traces are only included when
`NODE_ENV=development`.

## Deploying to Render

1. Push this repo to GitHub.
2. In Render: **New → Web Service**, connect the repo, set **Root
   Directory** to `server`.
3. Build command: `npm install`. Start command: `npm start`.
4. Add the environment variables from `.env.example` under the service's
   **Environment** tab (or use the included `render.yaml` Blueprint).
5. Once deployed, copy the Render URL into your client's
   `VITE_API_URL=.../api`, and set this service's `CLIENT_URL` to your
   Vercel domain so CORS + cookies work.
