---
title: Factory Pattern for Authorization
slug: /implementation/factory-pattern-for-authorization
---

# 🛡️ Factory Pattern Implementation for Authorization in NestJS

In **Blacktree**, we use a **flexible and extensible Factory Pattern** to authorize user actions on resources they own (e.g., deployments, user profile). This system ensures any resource ownership can be validated **without hardcoding logic for each resource type**.

---

## ✅ Overview

We implement **resource ownership checks** using:

1. A **custom decorator** `@CheckOwnership('resourceType')`
2. A **general-purpose guard** `OwnershipGuard`
3. A **factory provider** `ResourceServiceMapProvider` that maps each resource type (e.g., `user`, `deployment`) to:

   * The service responsible for it
   * The property name that holds the owner’s ID (e.g., `userId`)

---

## 🧱 How It Works – Step-by-Step Breakdown

### 1️⃣ `@CheckOwnership('resourceType')` Decorator

Used on controller routes to **declare which resource’s ownership** should be checked.

**Example Usage:**

```ts
@UseGuards(JWTClerkGuard, OwnershipGuard)
@CheckOwnership('user') // <--- Applies metadata
@Delete('/users/:id')
deleteUser() {
  // ...
}
```

It adds metadata to the route, specifying which resource this guard should validate ownership for.

---

### 2️⃣ OwnershipGuard: Enforcing Resource Ownership

```ts
@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(RESOURCE_SERVICE_MAP)
    private serviceMap: Record<string, ResourceEntry>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resourceType = this.reflector.get<string>(
      CHECK_OWNERSHIP_KEY,
      context.getHandler(),
    );

    if (!resourceType) return true; // No check needed

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userId = request.user.id;
    const resourceId = request.params.id;

    const resourceEntry = this.serviceMap[resourceType];
    if (!resourceEntry) {
      throw new Error(`Ownership service not found for: ${resourceType}`);
    }

    const { service, ownerField } = resourceEntry;
    const resource = await service.findById(resourceId);

    if (!resource || resource[ownerField] !== userId) {
      throw new ForbiddenException('You do not own this resource');
    }

    return true; // Ownership verified
  }
}
```

### Key Concepts:

* **Reflector**: Reads the metadata set by the decorator.
* **Dynamic Check**: Ownership is verified at runtime for any resource type, based on `serviceMap`.

---

### 3️⃣ Factory Provider: Mapping Resources to Services

```ts
export const ResourceServiceMapProvider = {
  provide: RESOURCE_SERVICE_MAP,
  useFactory: (
    usersService: UsersService,
    deploymentService: DeploymentService,
  ) => {
    return {
      user: { service: usersService, ownerField: 'id' },
      deployment: { service: deploymentService, ownerField: 'userId' },
    };
  },
  inject: [UsersService, DeploymentService],
};
```

### 🧩 What’s Happening Here:

* `provide: RESOURCE_SERVICE_MAP`: This token allows NestJS to inject this map anywhere via `@Inject(RESOURCE_SERVICE_MAP)`.
* `useFactory`: This function builds the map of resource types to their service and ownership field.
* `inject: [...]`: These services are injected into the factory function **before it runs**.

---

## ⚙️ Why CoreModule?

To avoid circular dependencies and make shared services/providers globally available, we place `ResourceServiceMapProvider` in a **CoreModule**.

**Example CoreModule Setup:**

```ts
@Module({
  imports: [UsersModule, DeploymentModule],
  providers: [ResourceServiceMapProvider],
  exports: [ResourceServiceMapProvider],
})
export class CoreModule {}
```

* **Imports**: Makes sure `UsersService` and `DeploymentService` are available to the factory.
* **Exports**: Allows `OwnershipGuard` and others to use `ResourceServiceMapProvider`.

---

## 📎 Notes on Usage

* **All routes using OwnershipGuard must pass the resource ID via `params.id`.**
* Services like `UsersService` must implement `findById(id: string)` returning the full resource.
* Owner fields must **match user ID** to validate ownership (e.g., `deployment.userId === userId`).

