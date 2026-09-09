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
- **isomorphic-dompurify** — sanitizes rich-text post content before it's saved
- **helmet / cors / express-rate-limit** — baseline security
- A small custom **CSRF middleware** (`middlewares/csrf.js`) that checks
  the request `Origin` header against `CLIENT_URL` on every non-safe
  request

## Project structure

```
server/
├─ src/
│  ├─ config/           # db.js, cloudinary.js — env-driven, no app logic
│  ├─ models/           # Mongoose schemas: User, Post, Comment
│  ├─ controllers/      # business logic per resource
│  ├─ routes/           # Express routers, one file per resource
│  ├─ middlewares/      # auth, csrf, validation, centralized error handling
│  ├─ utils/            # ApiError, ApiResponse, asyncHandler, sanitizeHtml, seedAdmin
│  ├─ app.js            # Express app assembly (middleware + route mounting)
│  └─ server.js         # entry point — connects DB, starts listener
├─ .env.example
├─ render.yaml           # optional Render Blueprint
└─ package.json
```


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

Uploads are limited to 5MB and image mimetypes only, stored under
`blog-app/post` (post cover images) or `blog-app/avatar`-style paths for
avatars, resized/optimized on upload via a Cloudinary transformation.

## CSRF protection

`middlewares/csrf.js` runs before every route and rejects any non-safe
method (anything but `GET`/`HEAD`/`OPTIONS`) unless the request's
`Origin` header exactly matches `CLIENT_URL`. This is on top of, not
instead of, the JWT auth check. Two practical implications:

- **`CLIENT_URL` must be set correctly** in every environment (including
  local dev — `http://localhost:5173` by default) or all writes will
  fail with a 403, even successful logins.
- **Tools like Postman/curl** won't send a browser `Origin` header by
  default, so direct API testing of `POST`/`PUT`/`DELETE` routes needs an
  `Origin` header set manually to match `CLIENT_URL`.

## Environment variables

See `.env.example` for the full list and inline comments. Summary:

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Token signing |
| `COOKIE_NAME` | Name of the httpOnly auth cookie |
| `CLIENT_URL` | Allowed CORS origin **and** the value checked by the CSRF middleware (your Vercel URL in production) |
| `CLOUDINARY_*` | Image upload credentials |
| `ADMIN_*` | Used only by `npm run seed:admin` |

## API reference

All routes are mounted at the **server root** — (i.e. the login route is `POST http://localhost:4000/auth/login`). 

All responses follow the same envelope:

```json
{ "success": true, "statusCode": 200, "message": "...", "data": { } }
```

Errors follow the same shape with `"success": false` and an optional
`errors` array of `{ field, message }` for validation failures.

### Auth — `/auth`

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Create account (`email`, `username`, `password`) |
| POST | `/login` | — | Log in (`emailOrUsername`, `password`) — sets auth cookie |
| POST | `/logout` | — | Clears the auth cookie |
| GET | `/me` | ✅ | Returns the current authenticated user |

Auth routes are additionally rate-limited (30 requests / 15 min per IP).

### Users — `/users`

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/` | ✅ admin | List all users |
| GET | `/:username` | — | Public profile |
| PUT | `/me` | ✅ | Update own `bio` |
| PUT | `/me/avatar` | ✅ | Upload avatar (`multipart/form-data`, field `avatar`) |
| PUT | `/:id/role` | ✅ admin | Change a user's `role` to `user` or `admin` |
| DELETE | `/:id` | ✅ admin | Delete a user |

### Posts — `/posts`

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/` | — | List published posts. Query: `page`, `limit`, `search`, `tag` |
| GET | `/user/:username` | — | Published posts by one author |
| GET | `/me` | ✅ | Current user's own posts, including drafts |
| GET | `/admin` | ✅ admin | All posts, including every user's drafts |
| GET | `/:slug` | optional | Single post by slug — drafts are only visible to their owner or an admin |
| POST | `/` | ✅ | Create post (`multipart/form-data`: `title`, `content`, `tags`, `status`, `coverImage`) |
| PUT | `/:slug` | ✅ owner/admin | Update post |
| DELETE | `/:slug` | ✅ owner/admin | Delete post — **admins can delete any post** |

Post `content` is sanitized server-side (`utils/sanitizeHtml.js`) before
saving, and an `excerpt` is auto-generated from the first few paragraphs
if one isn't provided. `search` matches against a MongoDB text index on
`title`/`content`/`tags`, plus a username match, so searching by author
name also works.

### Comments — `/posts/:postId/comments` and `/comments`

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/posts/:postId/comments` | optional | List comments on a post. Drafts require the owner or an admin |
| POST | `/posts/:postId/comments` | ✅ | Add a comment (`content`, optional `parentComment` for a reply, optional `mentionedUsername`) |
| DELETE | `/comments/:commentId` | ✅ owner/admin | Delete a comment |

Comments up to 1000 characters. `parentComment` links a reply to another
comment for simple threading.

### Health

`GET /health` — uptime check, useful for Render health checks / uptime pings.

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
5. Once deployed, copy the Render URL into your client's `VITE_API_URL`, and set this service's
   `CLIENT_URL` to your Vercel domain so CORS, cookies, and the CSRF
   check all work correctly.
