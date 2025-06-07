//TODO fix the problem with deployment ownership

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DeploymentService } from '../deployment.service';
import { EndpointService } from '../endpoint.service';
import { Request } from 'express';
import { RequestWithUser } from 'src/utils/types/RequestWithUser.interface';

@Injectable()
export class DeploymentOwnershipGuard implements CanActivate {
  constructor(
    private readonly deploymentService: DeploymentService,
    private readonly endpointService: EndpointService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & RequestWithUser>();

    const user = req.user; // type to be requestwithuser

    const params = req.params;

    let deploymentId: string | null = null;

    if (params.deploymentId) {
      deploymentId = params.deploymentId;
    }

    if (params.endpointId) {
      const endpoint = await this.endpointService.findByIdWithDeploymentAndUser(
        params.endpointId,
      );
      if (!endpoint) {
        throw new NotFoundException('Endpoint not found');
      }
      deploymentId = endpoint.deployment.id;
    }

    if (!deploymentId) {
      throw new NotFoundException('Deployment not found');
    }

    const deployment =
      await this.deploymentService.findByIdWithUser(deploymentId);
    if (!deployment) {
      throw new NotFoundException('Deployment not found');
    }
    if (deployment.user.id !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to access this deployment',
      );
    }
    return true;
  }
}
