// NOTE: This is structured such that for to check any resource, we need to pass the resource id in params and user id (that owns that resource) shooud be in req

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject, // used to inject custom dependeicies in this case ServiceMap
} from '@nestjs/common';
import { Reflector } from '@nestjs/core'; // to read metadata set by custom decorator
import { CHECK_OWNERSHIP_KEY } from './check-ownership.decorator'; // metadata key to identify which resource guard should check (the metadata is applied to controller using checkownership decorator)
import { RequestWithUser } from 'src/utils/types/RequestWithUser.interface';

type AnyResource = { [key: string]: unknown };

interface OwnableService<T extends AnyResource = AnyResource> {
  findById(id: string): Promise<T | null>;
}

interface ResourceEntry<T extends AnyResource = AnyResource> {
  service: OwnableService<T>;
  ownerField: keyof T;
}

export const RESOURCE_SERVICE_MAP = 'RESOURCE_SERVICE_MAP'; // someone ask for RESOURCE_SERVICE_MAP give them object in resource-service-map.provider.ts

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(RESOURCE_SERVICE_MAP)
    private serviceMap: Record<string, ResourceEntry>, // THIS IS THE FACTORY INJECTION. we define factory object in that map file and it injects the RESOURCE_SERVICE_MAP that is the provider name for the factory
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resourceType = this.reflector.get<string>( // this is getting the key like 'user' or 'deployment' to identify which key value of service and other to call see map in return the user key value
      CHECK_OWNERSHIP_KEY, // to identify the metadata
      context.getHandler(), // to get the handler's name
    );

    if (!resourceType) return true; // no metadata?? meaning no check

    const request = context.switchToHttp().getRequest<RequestWithUser>(); // getting the request
    const userId = request.user.id; // getting the user id
    const resourceId = request.params.id; // getting the resource id from the params like deployment and such

    const resourceEntry = this.serviceMap[resourceType]; // we get the object { service: usersService, ownerField: 'id' },

    if (!resourceEntry) {
      throw new Error(`Ownership service not found for: ${resourceType}`);
    }

    const { service, ownerField } = resourceEntry;
    const resource = await service.findById(resourceId); // and to find we need to get the user of which entity

    if (!resource || resource[ownerField] !== userId) {
      // we identify if userId in deployment or id in user entity matches to user that is trying to modify or not
      throw new ForbiddenException('You do not own this resource');
    }

    return true;
  }
}
