---
title: Clerk Authentication
sidebar_position: 2
---

# Clerk Authentication

Blacktree uses **Clerk** for user sign-up, login, and session management. Clerk simplifies authentication by handling session tokens, user accounts, and secure frontend/backend validation.

---

## The complete flow

![alt text](<Untitled diagram _ Mermaid Chart-2025-07-29-174424.png>)

---

## User Flow with Clerk

1. User visits the Blacktree dashboard.
2. They click **Start Building** or **Open Marketplace**.
3. If not signed in, they are redirected to `/auth/signup`.
4. Users can:
   - **Sign up with Google**
   - **Sign up with GitHub** _(Note: GitHub OAuth here only provides your email, not repo access.)_
   - Or sign up manually with name and email.

---

## Clerk Authentication Flow (Step-by-Step with File Paths)

### User lands on the dashboard page

- Clerk automatically checks if the user is signed in via an **HttpOnly cookie** it manages.
- If the user is not signed in, the middleware will redirect to the signup page.
- reference: [Middleware.ts](#middlewarets-nextjs)

### Middleware handles redirection if unauthenticated

- This middleware is defined globally and protects all routes except `/auth, /sso-callback and `/`.
- If the user is not authenticated, they are redirected to `/auth/signup`.
- reference: [Signup.tsx](#signuptsx-nextjs)

### If the user is signed in, a custom hook `useSyncUser()` is triggered

- This hook extracts user data from Clerk, constructs a user object (`email`, `firstName`, `lastName`, `clerkId`, `imgUrl`), and sends it to the main backend at `/users/clerk-sync`.
- reference: [userSync.tsx](#usersynctsx-nextjs)

### Backend receives the user object and stores it in the database.

- This ensures that Clerk’s user is mirrored in the backend for identification, analytics, etc.
- Backend endpoint: `POST /users/clerk-sync`

### After successful sync, frontend calls `/api/auth/set-token`

- This is a **Next.js route** (not backend) that generates a **JWT token** using Clerk’s session and stores it in a secure, HttpOnly cookie.
- reference: [set-token](#set-token-nextjs)

### Once token is set, frontend calls `/users/me` on backend to fetch user data

- This is done via `fetchUser()` method from the `useAuth()` context.
- The response populates the frontend user context so the UI can display name, email, and other user details.
- File:
  - Context: `apps/web/src/context/AuthContext.tsx`
  - Fetch call: `GET /users/me` (main backend)

### Final state

- The user is now authenticated, synced to backend, and has a secure JWT token for all backend API requests.
- Frontend displays personalized UI using data from context.

---

## Code References

### Middleware.ts (NextJs)

**File :** `apps/web/src/middleware.ts`
Most of the middleware.ts logic is from the clerk docs but in line 4

```ts
const isPublicRoute = createRouteMatcher(["/auth(.*)", "/", "/sso-callback"]);
```

this enables these to be public route and please **NOTE** that /sso-callback is important to be included here.

### Signup.tsx (NextJs)

**File :** `apps/web/src/app/auth/signup/page.tsx`
authentication is possible in two ways

- Filling the form and sending the request to the clerk.
- Using `useOAuthSignIn.ts`'s hook (only email, name and profile photos are accessed)

```ts
const result = await signIn.authenticateWithRedirect({
  strategy, // it is to be passed in hook, either github or google
  redirectUrl: "/sso-callback",
  redirectUrlComplete: redirectPath,
});
```

### userSync.tsx (NextJs)

**File :** `apps/web/src/utils/clerk/userSync.tsx`
This is responsible for 3 tasks

- check if the user is logged in or not using clerk.
- sync the data to backend
- `fetchUser()` from authContext signins

### set-token (Nextjs)

**File :** `apps/web/src/app/api/auth/set-token/route.ts`
In main backend we are using jwt as a middleware to check if the request comes from legit user or not. And to send the jwt token, we store it in the **httponly** cookie.

```ts
response.cookies.set({
  name: "jwt",
  value: jwtToken,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 90,
});
```

- Retrieves the Clerk session ID using `auth()` from Clerk SDK.
- Uses the session ID to request a JWT token from Clerk’s servers using a **Clerk Token Template**.
- Sets the token in an HttpOnly cookie named `jwt` for secure backend communication.
- Token cookie is configured with:
  - `httpOnly: true`
  - `secure: true` (in production)
  - `sameSite: "lax"`
  - `path: "/"`
  - `maxAge: 90 days`
