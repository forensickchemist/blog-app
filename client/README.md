# BlogApp — Client

Vue 3 (Composition API, `<script setup>`) + Vite frontend for the BlogApp
MEVN project. Deployed to **Vercel**.

## Stack

- **Vue 3** + **Vite**
- **Vue Router 4** — with `requiresAuth` / `requiresGuest` / `requiresAdmin`
  navigation guards
- **Pinia** — state management
- **Axios** — API client with interceptors
- **Tiptap** — rich-text editor for post content (`@tiptap/vue-3`,
  `starter-kit`, `extension-link`)
- **Bootstrap 5** + **Bootstrap Icons** — layout/components/iconography
- Custom **design-token CSS** (`variables.css` + `global.css`) layered on
  top of Bootstrap

## Project structure

```
client/
├─ src/
│  ├─ assets/styles/
│  │  ├─ variables.css   # every color/font/spacing token — edit THIS to retheme
│  │  └─ global.css      # base styles + utility classes, consumes the tokens
│  ├─ components/
│  │  ├─ common/         # BaseButton, BaseInput, BaseAlert, BaseCard, BaseLoader,
│  │  │                  # BasePagination, BaseSearch, EmptyState, ConfirmModal,
│  │  │                  # ImageCropper — generic, reusable
│  │  ├─ blog/            # PostCard, PostForm (Tiptap editor), CommentSection — app-specific
│  │  ├─ admin/            # AdminStatCard, AdminPostTable, AdminUserTable — app-specific
│  │  └─ layout/           # AppNavbar, AppFooter
│  ├─ views/               # one component per route (Home, PostDetail, PostCreate,
│  │                        # PostEdit, Dashboard, Admin, Profile, Login, Register, NotFound)
│  ├─ router/index.js       # routes + auth/admin guards
│  ├─ store/                # Pinia stores (auth.js reusable, post.js app-specific)
│  ├─ services/             # axios wrappers — api.js core, auth/user/post/comment services
│  └─ main.js / App.vue
├─ index.html
├─ vercel.json               # SPA rewrite rule
└─ package.json
```

## Getting started locally

```bash
cd client
cp .env.example .env       # point VITE_API_URL at your backend
npm install
npm run dev                 # http://localhost:5173
```

## Environment variables

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the backend API : the server mounts its routes at the root (e.g. `.../auth/login`, `.../posts`). Use `http://localhost:4000` in dev, your Render URL in production |


## Design system

`src/assets/styles/variables.css` is the single source of truth for color,
typography, spacing, radii, and shadows — including overrides for
Bootstrap's own CSS variables, so Bootstrap components (buttons, alerts,
badges, forms) automatically pick up the app's palette without touching a
single Bootstrap file. `global.css` builds on those tokens with base
element styles and a small set of utility classes (`.app-card`,
`.btn-app-primary`, `.app-tag`, `.empty-state`, etc.) used throughout the
components.

**To re-skin the app** (or reuse this skeleton for a different project),
edit the values in `variables.css` only — colors, fonts, spacing all
propagate from there.

## Key components

- **`PostForm.vue`** — create/edit form for posts, built around the
  Tiptap rich-text editor (`@tiptap/vue-3` + `starter-kit` + the `Link`
  extension) instead of a plain textarea.
- **`ImageCropper.vue`** (common) — client-side crop step used before an
  avatar or cover image is uploaded, so users can frame the image before
  it's sent to Cloudinary.
- **`CommentSection.vue`** (blog) — lists a post's comments, supports
  posting a top-level comment or a reply (`parentComment`), and lets the
  comment's author or an admin delete it.
- **`AdminStatCard.vue` / `AdminPostTable.vue` / `AdminUserTable.vue`**
  (admin) — the building blocks of `views/Admin.vue`: summary stats, a
  table of every post (including drafts) with delete actions, and a
  table of every user with role-change/delete actions.

## State management

- **`store/auth.js`** — current user, `isAuthenticated` / `isAdmin`
  getters, login/register/logout/fetchCurrentUser actions. Session is
  restored on app boot via `fetchCurrentUser()` in `main.js`.
- **`store/post.js`** — post list + pagination + "current post" for the
  detail view, mirroring `post.service.js`.

## Routing & guards

Route `meta` flags drive a single global guard in `router/index.js`:

- `meta: { requiresAuth: true }` — redirects to `/login?redirect=...` if
  not authenticated (used by post create/edit, dashboard).
- `meta: { requiresGuest: true }` — redirects authenticated users away
  from `/login` and `/register`.
- `meta: { requiresAuth: true, requiresAdmin: true }` — used by `/admin`;
  redirects non-admins home.

Routes at a glance: `/` (home/post list), `/posts/:slug` (post detail),
`/posts/new` and `/posts/:slug/edit` (auth), `/profile/:username`
(public), `/dashboard` (auth — the current user's own posts), `/admin`
(admin only), `/login` and `/register` (guest only).

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel: **New Project**, import the repo, set **Root Directory** to
   `client`.
3. Framework preset: Vite. Build command: `npm run build`. Output
   directory: `dist`.
4. Add environment variable `VITE_API_URL` pointing at your deployed
   Render backend (see Environment
   variables above).
5. `vercel.json` already includes the SPA rewrite so client-side routes
   (e.g. `/posts/my-post-slug`) don't 404 on refresh.
