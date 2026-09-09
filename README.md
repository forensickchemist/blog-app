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
- CSRF protection on all unsafe requests (checks the request `Origin`
  against the configured client URL)

**Blog post management (CRUD)**
- Create, read, update, and delete posts — each with a title, rich-text
  content (Tiptap editor), cover image, tags, author, and creation date
- Auto-generated slugs and excerpts
- Draft / published status, with drafts visible only to their author and
  admins

**Comments**
- Threaded comments on posts (replies via `parentComment`), with optional
  `@mention` support
- Comment authors and admins can delete a comment; anyone can read
  comments on a published post

**User profiles**
- Public profile pages (`/profile/:username`) showing a user's bio,
  avatar, and published posts
- Users can update their own bio and upload/crop an avatar image
  (client-side cropping before upload)

**Admin dashboard**
- Stat cards, a full post table (including drafts), and a user table
- Promote/demote users between `user` and `admin`
- Delete any user or any post

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
cp .env.example .env    # VITE_API_URL=http://localhost:4000
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

> **Note:** the API routes are mounted at the server root (`/auth`,
> `/users`, `/posts`, `/posts/:postId/comments`, `/comments`), set `VITE_API_URL` to the bare host
> (`http://localhost:4000` locally, or your Render URL in production)
> instead. See `server/README.md` → API reference for the full route list.

## Try it out

A live demo is deployed at [`https://blog-app-seven-hazel.vercel.app/`]. You're welcome to register your own account, or email me to request a test username/password — useful if you want to try admin-only features (the /admin dashboard, deleting other users' posts, etc.) without going through the npm run seed:admin script yourself.

## Deployment

| Piece | Platform | Notes |
|---|---|---|
| `server/` | [Render](https://render.com) | Web Service, root dir `server`, see `server/render.yaml` |
| `client/` | [Vercel](https://vercel.com) | root dir `client`, see `client/vercel.json` |
| Images | [Cloudinary](https://cloudinary.com) | credentials live only in the server's env vars |

Deploy the backend first, then point the frontend's `VITE_API_URL` at the
live Render URL, and the backend's
`CLIENT_URL` at the live Vercel URL (required for CORS, cookies, and CSRF
checks to work correctly).



## Tech stack summary

| Layer | Technology |
|---|---|
| Frontend | Vue 3, Vite, Vue Router, Pinia, Axios, Tiptap (rich-text editor), Bootstrap 5, Bootstrap Icons |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB |
| Auth | JWT (httpOnly cookie + Bearer fallback), bcrypt, CSRF origin check |
| Image hosting | Cloudinary (via a custom Multer storage engine) |
| Hosting | Vercel (client), Render (server) |

## License

Fritz Cabalhin
