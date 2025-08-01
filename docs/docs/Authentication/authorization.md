---
title: Authentication & Authorization in backend
sidebar_position: 4
---

## 🔐 Authentication with JWTClerkGuard
**Purpose**: Ensures that only authenticated users can access protected routes. 

The [set-token](clerk-auth.md#set-token-nextjs) in NextJs frontend is responsible for setting up the JWT token in the HttpOnly cookie.

When we send any request to the backend, the JWT token is automatically included in the cookie. The backend uses the `JWTClerkGuard` to verify this token and ensure the user is authenticated.

#### How it works:
- The `JWTClerkGuard` checks the presence of the JWT token in the request.
- If the token is valid, it allows access to the route.
- If the token is invalid or missing, it returns a 401 Unauthorized response.

##  🧾 Authorization with OwnershipGuard
**Purpose**: Prevents users from modifying or accessing resources they don’t own.

#### How it Works:
- Decorator @CheckOwnership('resourceType') is applied to routes which adds a metadata to the route handler.
- Guard OwnershipGuard intercepts request, checks:
    - The resource type (e.g., 'user', 'deployment')
    - The resource ID from route params
    - The owner of that resource via a service
    - Matches owner against req.user.id

```ts
// Example entry
user: { service: UsersService, ownerField: 'id' },
deployment: { service: DeploymentService, ownerField: 'userId' }
```
we have this kind of metadata for each resource type. For example for `deployment` resource type, it checks if the user is the owner of the deployment by comparing `req.user.id` with `deployment.userId`.

## 🏗️ Implementation Overview
```ts
@UseGuards(JWTClerkGuard, OwnershipGuard)
@CheckOwnership('deployment')
deleteDeployment(@Param('id') id: string) { ... }
```

This is how we are using the guards in our controllers. Where

- `JWTClerkGuard` ensures the user is authenticated.
- `OwnershipGuard` checks if the user owns the deployment they are trying to modify and the resource data is given in params.
- `@CheckOwnership('deployment')` specifies the resource type to check and add metadata for the guard to read. 

Check out factory pattern implementation in `src/guards/ownership.guard.ts` and `src/guards/check-ownership.decorator.ts` for more details [here](../implementation/factory-pattern-for-authorization.md#️-factory-pattern-implementation-for-authorization-in-nestjs).





