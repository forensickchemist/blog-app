# BlogApp — MEVN Stack Blog Application

A full-stack blog platform built on the **MEVN** stack (MongoDB, Express,
Vue, Node), designed as a **reusable project skeleton**: the auth system,
error handling, API layer, and component library are written to be
generic, so this repo can become the starting point for a different kind
of app (shop, portfolio, forum, recipe box...) with minimal editing.

- **`server/`** — Express + MongoDB REST API → deploy to **Render**
- **`client/`** — Vue 3 + Vite SPA → deploy to **Vercel**
- **Images** hosted on **Cloudinary**
- Styling with **Bootstrap 5**, **Bootstrap Icons**, and a custom
  CSS design-token system

Each folder has its own detailed README — [`server/README.md`](./server/README.md)
and [`client/README.md`](./client/README.md) — this file covers the
project as a whole.

## Features

**Authentication**
- Register with email, username, and password
- Secure login (JWT in an httpOnly cookie, with a Bearer-token fallback)
- Passwords hashed with bcrypt, never stored or returned in plain text

**Blog post management (CRUD)**
- Create, read, update, and delete posts — each with a title, rich-text
  content, cover image, tags, author, and creation date
- Auto-generated slugs and excerpts

**Access rules**
- Anyone (logged in or not) can browse all posts and view a single post
- Logged-in users can create posts, and edit/delete their **own** posts
- Admins can delete **any** post, and can list all registered users

**Other**
- Centralized error handling with a consistent JSON response envelope
- Request validation on all write endpoints
- Pagination + search + tag filtering on the post list
- Rate limiting on auth endpoints
- Responsive UI with a light/dark-mode-ready design-token system

## Architecture at a glance

```
Client (Vue 3 SPA, Vercel)  ──HTTPS──▶  Server (Express API, Render)  ──▶  MongoDB Atlas
        │                                        │
        └── image files ───────────────────────▶ Cloudinary
```

- The client never talks to MongoDB or Cloudinary directly — all writes go
  through the API, which is the only thing holding credentials.
- Auth state travels as an httpOnly cookie (primary) with a
  `localStorage` bearer token as a fallback for browser setups that block
  third-party cookies across the Vercel/Render domains.

## Getting started (local development)

You'll run two dev servers side by side.

```bash
# Terminal 1 — backend
cd server
cp .env.example .env    # fill in MONGO_URI, JWT_SECRET, CLOUDINARY_*
npm install
npm run dev              # http://localhost:4000

# Terminal 2 — frontend
cd client
cp .env.example .env    # VITE_API_URL=http://localhost:4000/api
npm install
npm run dev              # http://localhost:5173
```

You'll need:
- **Node 18+**
- A **MongoDB** connection string — [MongoDB Atlas](https://www.mongodb.com/atlas)
  has a free tier that works fine for this
- A **Cloudinary** account (free tier) for its cloud name, API key, and
  API secret

Optionally seed an admin account — see `server/README.md`.

## Deployment

| Piece | Platform | Notes |
|---|---|---|
| `server/` | [Render](https://render.com) | Web Service, root dir `server`, see `server/render.yaml` |
| `client/` | [Vercel](https://vercel.com) | root dir `client`, see `client/vercel.json` |
| Images | [Cloudinary](https://cloudinary.com) | credentials live only in the server's env vars |

Deploy the backend first, then point the frontend's `VITE_API_URL` at the
live Render URL, and the backend's `CLIENT_URL` at the live Vercel URL
(required for CORS + cookies to work correctly).

## Reusing this skeleton for a different project

This codebase was deliberately split into two layers:

1. **Reusable core** — auth (register/login/logout/JWT), the
   `User` model, centralized error handling (`ApiError` / `ApiResponse` /
   `asyncHandler`), the Cloudinary upload config, the Axios wrapper, the
   Pinia auth store, the router's guard pattern, and the whole
   `components/common/` library (buttons, inputs, alerts, cards, modals,
   pagination, empty states). None of these files know anything about
   "blog posts" — every file that's part of the core has a header comment
   saying **REUSABLE CORE**.
2. **App-specific layer** — everything about `Post`: the model, its
   controller/routes, `PostForm`/`PostCard`, the `post` Pinia store, and
   the blog-flavored views (`Home`, `PostDetail`, `PostCreate`,
   `PostEdit`, `Dashboard`). These files are marked **APP-SPECIFIC** in
   their header comments.

To repurpose this for, say, a recipe app:

1. Copy the repo, rename `Post` → `Recipe` throughout `models/`,
   `controllers/`, `routes/` on the backend, and `post.service.js` /
   `store/post.js` / `components/blog/` on the frontend — swap the fields
   to match (e.g. `ingredients`, `cookTime` instead of `tags`).
2. Everything under **reusable core** (auth, error handling, the
   component library, the design-token CSS) stays as-is.
3. Retheme instantly by editing only
   `client/src/assets/styles/variables.css`.
4. Update the two READMEs' feature lists and you have a new app running
   on the same skeleton.

## Tech stack summary

| Layer | Technology |
|---|---|
| Frontend | Vue 3, Vite, Vue Router, Pinia, Axios, Bootstrap 5, Bootstrap Icons |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB |
| Auth | JWT (httpOnly cookie + Bearer fallback), bcrypt |
| Image hosting | Cloudinary (via Multer storage engine) |
| Hosting | Vercel (client), Render (server) |

## License

MIT — use this skeleton freely for your own projects.
