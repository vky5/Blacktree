---
title: GitHub Integration
sidebar_position: 3
---

# GitHub Integration

Blacktree uses GitHub for two purposes:

1. Sign-up and login via OAuth (for user info only).
2. Manual repository connection to enable deployment from your repos.

This section explains both flows and how GitHub tokens are handled securely.

---

## OAuth During Sign-Up

- Users can sign up with GitHub via Clerk.
- Only public profile info (name, email) is accessed.
- No repository access is granted at this stage.
reference: [Signup.tsx](clerk-auth.md#signuptsx-nextjs)

---

## Connecting GitHub Repositories

- After login, user can connect GitHub to link repos for deployment.
- This triggers GitHub OAuth flow with `repo`, `admin:repo_hook` scopes.

**File Reference:**  
`apps/web/src/app/connect/github/page.tsx`

---

## Handling GitHub Access Token

- After OAuth, backend stores the token securely for API usage.

**File Reference:**  
`backend/src/users/githubToken.controller.ts`

---

## Fetching Repositories

- Using the token, GitHub API is used to fetch repos for selection.

**File Reference:**  
(e.g.) `apps/web/src/hooks/useGithubRepos.ts`

---

## Security Notes

- Tokens are stored securely.
- User can revoke access anytime via GitHub settings.

---

*End of GitHub Integration Overview*
