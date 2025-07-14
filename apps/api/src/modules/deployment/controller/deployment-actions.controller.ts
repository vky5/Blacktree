import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FakeGuard } from 'src/guards/fake.guard';
import { DeploymentOwnershipGuard } from '../guards/deployment-ownership.guard';
import { DeploymentActionService } from '../service/deployment-action.service';
import { Deployment } from '../entities/deployment.entity';

@UseGuards(FakeGuard)
@Controller('deployment')
export class DeploymentActionsController {
  constructor(
    @InjectRepository(Deployment)
    private readonly deploymentActionService: DeploymentActionService,
  ) {}

  // Build image (handled by worker + orchestrator)
  @UseGuards(DeploymentOwnershipGuard)
  @Post(':deploymentId/build')
  @HttpCode(HttpStatus.OK)
  buildDeployment(@Param('deploymentId') deploymentId: string) {
    return this.deploymentActionService.buildDeployment(deploymentId);
  }

  // Trigger ECS deployment (manual launch)
  @UseGuards(DeploymentOwnershipGuard)
  @Post(':deploymentId/trigger')
  @HttpCode(HttpStatus.OK)
  async triggerDeployment(@Param('deploymentId') deploymentId: string) {
    return this.deploymentActionService.triggerDeployment(deploymentId);
  }

  // to stop the running deployment uses ARN
  @UseGuards(DeploymentOwnershipGuard)
  @Post(':deploymentId/stop')
  @HttpCode(HttpStatus.OK)
  async stopDeployment(@Param('deploymentId') deploymentId: string) {
    return this.deploymentActionService.stopDeployment(deploymentId);
  }

  //soft delete container
  @UseGuards(DeploymentOwnershipGuard)
  @Delete(':deploymentId/delete')
  @HttpCode(HttpStatus.OK)
  async softDeleteDeployment(@Param('deploymentId') deploymentId: string) {
    return this.deploymentActionService.cleanResources(deploymentId);
  }
}
