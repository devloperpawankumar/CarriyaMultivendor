## 401 Unauthorized – What was the issue?

You were seeing `401 Unauthorized` when trying to:

- **Login** (`/api/auth/login`)
- Use features that need a logged-in user (cart merge, buyer account, seller dashboard, admin routes, etc.)

This was confusing because login should be a **public** endpoint (you don’t have a token yet).

---

## The real cause (backend)

In the backend, multiple routers are mounted like this in `backend/src/index.js`:

- `app.use('/api', adminRouter)`
- `app.use('/api', buyerRouter)`
- `app.use('/api', sellerSettingsRouter)`
- `app.use('/api', notificationsRouter)`
- `app.use('/api', authRouter)`
- etc.

Some of those routers had this inside them:

- `router.use(requireAuth);`

Because these routers are mounted at `/api`, an unscoped `router.use(requireAuth)` means:

> **Every request that starts with `/api/...` gets blocked** unless it already has a valid token cookie/header.

So your request to **`/api/auth/login`** was being intercepted and blocked by `requireAuth` *before* it reached the login controller.

That’s why login returned:

```json
{ "error": "Unauthorized" }
```

and why you never got a `token` cookie in the browser.

---

## Why it broke login specifically

Login is supposed to:

1. Accept email + password
2. Generate a JWT
3. Set a cookie named `token`
4. Return user data

But the request never reached step (1), because `requireAuth` requires the cookie/token **already**:

- If token is missing → it returns **401 Unauthorized**

So it became an impossible situation: **you needed to be logged-in to log-in**.

---

## The fix (what we changed)

We scoped auth middleware to only apply to the routes that really need it.

Instead of:

- `router.use(requireAuth)`

we changed it to apply only to specific prefixes, for example:

- Admin router: protect only `/api/admin/*`
- Buyer router: protect only `/api/buyer/*`
- Seller routes: protect only `/api/seller/*`

This ensures:

- ✅ `/api/auth/login` stays public (no token needed)
- ✅ `/api/auth/signup` stays public
- ✅ Protected routes still require auth (buyer/seller/admin pages)

Files changed:

- `backend/src/routes/admin.js`
- `backend/src/routes/buyer.js`
- `backend/src/routes/sellerSettings.js`
- `backend/src/routes/notifications.js`

---

## Why the frontend `api.ts` line was NOT the issue

In `frontend/src/services/api.ts`, you had:

```ts
fetch(url, { ...options, headers, credentials: 'include' })
```

This is correct for cookie-based auth.

The backend was the one blocking login early, so the cookie was never created.

---

## Quick rule to avoid this bug again

If a router is mounted like this:

```js
app.use('/api', someRouter);
```

Then **never** put a global middleware inside that router like this:

```js
router.use(requireAuth);
```

Unless you truly want to protect **all `/api/*` routes**.

Instead, scope it:

```js
router.use('/admin', requireAuth);
```

---

## After the fix (expected behavior)

- `POST /api/auth/login`
  - ✅ 200 when credentials are correct
  - ✅ Sets `token` cookie
  - ❌ 401 only when credentials are wrong

- Protected endpoints (example):
  - `GET /api/buyer/account`
  - `GET /api/seller/settings`
  - `GET /api/admin/dashboard`
  - ✅ work only after login
  - ❌ return 401 if token is missing/invalid


