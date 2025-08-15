---
title: Overview
sidebar_position: 1
---

## 🔐 Overview

Authentication in Blacktree is designed to be **simple for users**, but **powerful and secure under the hood**.

We use **Clerk** for user sign-up and session management, and **GitHub OAuth** (custom flow) when we need access to user repositories and automate deployments (webhooks, CI/CD). On top of that, we use **JWT tokens** and **ownership-based authorization** in the backend to make sure users can only access what they own.

---

### 1. Clerk for User Sign Up & Session

Users can sign up or log in using **Google**, **GitHub**, or email. Clerk manages the session via **secure HttpOnly cookies**.

* When a user signs in, we **sync their profile** to our backend (via `/users/clerk-sync`) to keep a mirror record (email, name, Clerk ID, etc.).
* We then generate a **JWT token** from Clerk and store it in a cookie (`/api/auth/set-token`).
  This token is used for all secure backend API calls.

---

### 2. GitHub OAuth for Repo Access

When a user wants to **connect GitHub for deploying apps**, they go through a **separate GitHub OAuth flow** managed by Blacktree.

* We request specific **scopes** (like `repo`, `admin:repo_hook`) so we can:

  * List their repositories
  * Create webhooks for CI/CD
* This token is **exchanged and stored** securely in the backend and tied to the user’s profile.

---

### 3. Backend Authorization: JWT & Ownership

The backend uses two main guards to protect resources:

* **JWTClerkGuard**: Verifies the Clerk-generated JWT token in every request.
  If valid, the user’s identity is extracted and attached to the request.

* **OwnershipGuard**: Makes sure users can only access or modify resources they own (like their deployments).
  This is done via a **@CheckOwnership('resource')** decorator and a smart metadata-service map.

---

### Diagram of the Full Flow

If you're visual, check out the [this](clerk-auth.md#the-complete-flow) that shows **how Clerk auth, token sync, and backend protection all connect**.
This gives you a high-level overview of how authentication and authorization work in Blacktree. Each component is designed to ensure a smooth user experience while maintaining security and ownership integrity in the backend.