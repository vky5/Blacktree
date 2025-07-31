import { SetMetadata } from '@nestjs/common';

export const CHECK_OWNERSHIP_KEY = 'checkOwnership';

export const CheckOwnership = (resourceType: string) =>
  SetMetadata(CHECK_OWNERSHIP_KEY, resourceType);

/*
When we use this on the top of the function we are saying
This says: “Attach check_ownership = 'user' (or any string) to the route handler.”


```
@UseGuards(JWTClerkGuard, OwnershipGuard)
@CheckOwnership('user') // <--- This sets metadata
@Delete('/users/:id')
deleteUser() {
  // ...
}
```

in ur guard  you use Reflector to read this metadata:
```
const resourceType = this.reflector.get<string>(
  CHECK_OWNERSHIP_KEY,       // key
  context.getHandler(),      // target: the route handler
);

```
If the route had @CheckOwnership('user'), then:

resourceType === 'user'


Here’s the order NestJS processes a request:

- Route Match: NestJS finds which controller + method matches the request URL.
- Resolve Metadata: NestJS inspects the route before running guards.\
- Apply Guards: Now, with metadata already resolved, NestJS executes the guards.
- Run Controller Logic: If guards allow, NestJS calls your controller method.

When NestJS matches a route, it already knows:
The controller
The method (handler function)
Any attached metadata (from decorators like @CheckOwnership)



one more thing we can get the controller's class using context.getClass() and create an instance and run any method of that instance bypassing any guard but we shouldnt do it.


*/
