import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { FakeGuard } from 'src/guards/fake.guard';
import { DeploymentOwnershipGuard } from '../guards/deployment-ownership.guard';
import { DeploymentActionService } from '../service/deployment-action.service';
import { RequestWithUser } from 'src/utils/types/RequestWithUser.interface';

@UseGuards(FakeGuard)
@Controller('deployment')
export class DeploymentActionsController {
  constructor(
    private readonly deploymentActionService: DeploymentActionService,
  ) {}

  // Build image (handled by worker + orchestrator)
  @UseGuards(DeploymentOwnershipGuard)
  @Post(':deploymentId/build')
  @HttpCode(HttpStatus.OK)
  buildDeployment(
    @Param('deploymentId') deploymentId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.deploymentActionService.buildDeployment(
      deploymentId,
      req.user.id,
    );
  }

  // Trigger ECS deployment (manual launch)
  @UseGuards(DeploymentOwnershipGuard)
  @Post(':deploymentId/trigger')
  @HttpCode(HttpStatus.OK)
  triggerDeployment(@Param('deploymentId') deploymentId: string) {
    return this.deploymentActionService.triggerDeployment(deploymentId);
  }

  // to stop the running deployment uses ARN
  @UseGuards(DeploymentOwnershipGuard)
  @Post(':deploymentId/stop')
  @HttpCode(HttpStatus.OK)
  async stopDeployment(@Param('deploymentId') deploymentId: string) {
    try {
      await this.deploymentActionService.stopDeployment(deploymentId);

      return {
        status: 'success',
        message: 'Deployment stopped successfully',
      };
    } catch (error) {
      console.error('[STOP_DEPLOYMENT_ERROR]', error);
      throw new InternalServerErrorException('Failed to stop the container');
    }
  }

  //soft delete container
  @UseGuards(DeploymentOwnershipGuard)
  @Delete(':deploymentId/delete')
  @HttpCode(HttpStatus.OK)
  async softDeleteDeployment(@Param('deploymentId') deploymentId: string) {
    try {
      await this.deploymentActionService.cleanResources(deploymentId);

      return {
        status: 'success',
        message: 'Deployment resources cleaned and soft-deleted successfully',
      };
    } catch (error) {
      console.error('[DELETE_DEPLOYMENT_ERROR]', error);
      throw new InternalServerErrorException(
        'Failed to delete deployment resources',
      );
    }
  }

  // restarting the container from existing ARN
  @UseGuards(DeploymentOwnershipGuard)
  @Post(':deploymentId/restart')
  @HttpCode(HttpStatus.OK)
  restartDeployment(@Param('deploymentId') deploymentId: string) {
    return this.deploymentActionService.restartDeployment(deploymentId);
  }
}
