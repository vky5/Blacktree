import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FakeGuard } from 'src/guards/fake.guard';
import { DeploymentOwnershipGuard } from './guards/deployment-ownership.guard';
import { DeploymentActionService } from './deployment-action.service';

@UseGuards(FakeGuard)
@Controller()
export class DeploymentActionsController {
  constructor(private deploymentActionService: DeploymentActionService) {}

  @UseGuards(DeploymentOwnershipGuard)
  @Post('/build/:deploymentId')
  @HttpCode(HttpStatus.OK)
  buildDeployment(@Param('deploymentId') deploymentId: string) {
    return this.deploymentActionService.buildDeployment(deploymentId);
  }
}
