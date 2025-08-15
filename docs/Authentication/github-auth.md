---
title: GitHub Integration
sidebar_position: 3
---

# GitHub Integration

Blacktree uses **two different GitHub authentication flows** depending on the context:

---

## 1. GitHub OAuth via Clerk (for Sign Up/Login)

* When users sign up via GitHub on Clerk, the only permission requested is to access their **public email** and **basic profile info**.
* This is handled entirely by Clerk — Blacktree does **not** get any repo access or tokens in this flow.

---

## 2. GitHub OAuth via Blacktree (for Repo Access + Webhook Setup)

When the user wants to **connect their GitHub account** to deploy projects, we need:

* Access to their repositories.
* Ability to create webhooks for CI/CD.

---

## 🧩 OAuth Flow for Repo Access

![alt text](<Untitled diagram _ Mermaid Chart-2025-08-01-171825.png>)

### Step 1: User clicks “Connect GitHub”

* This triggers a redirect to GitHub OAuth URL with required scopes:

```tsx
// apps/web/src/components/Developers/Page1/GithubConnect.tsx

const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=repo%20admin:repo_hook%20read:user%20user:email`;

// Scope explanation:
// repo - access to repositories
// admin:repo_hook - create webhooks
// read:user, user:email - read profile and email
```

---

### Step 2: GitHub Redirects Back with Code

* GitHub redirects to your frontend with a **code** query parameter.
* This code is sent to the backend to exchange for a token.

---

### Step 3: Frontend Exchanges Code → Token (Next.js API Route)

```ts
// apps/web/src/app/api/github/exchange/route.ts

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!,
    client_secret: process.env.GITHUB_CLIENT_SECRET!,
    code,
  });

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json" },
    body: params,
  });

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  // Forward token to backend for storage & verification
  await axios.post(`${BACKEND_URL}/users/project-access`, { token: accessToken }, { withCredentials: true });
}
```

---

### Step 4: Backend Stores Token for User (NestJS)

```ts
// src/auth/auth.service.ts

async getGithubAccessToken(code: string): Promise<string> {
  const payload = {
    client_id: this.configService.get('GITHUB_CLIENT_ID'),
    client_secret: this.configService.get('GITHUB_CLIENT_SECRET'),
    code,
  };

  const res = await axios.post<GithubAccessTokenResponse>(
    'https://github.com/login/oauth/access_token',
    payload,
    { headers: { Accept: 'application/json' } },
  );

  if (!res.data.access_token) {
    throw new UnauthorizedException('Failed to get token');
  }

  return res.data.access_token;
}

// Then token is saved in DB under user's profile
```

---

## ✅ Summary

* **Frontend** handles the GitHub OAuth code exchange.
* **Backend** stores the access token securely for future use (e.g., creating webhooks, listing repos).
* This access token is critical for enabling **CI/CD automation** in Blacktree.