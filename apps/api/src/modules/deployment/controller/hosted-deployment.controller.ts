import {
  Controller,
  Get,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { DeploymentService } from '../service/deployment.service';
import { FakeGuard } from 'src/guards/fake.guard';
import { RequestWithUser } from 'src/utils/types/RequestWithUser.interface';

@UseGuards(FakeGuard)
@Controller('hosted')
export default class HostedDeploymentController {
  constructor(private readonly deploymentService: DeploymentService) {}
  @Get()
  @HttpCode(HttpStatus.OK)
  getAllDeployedInstanes(@Req() req: RequestWithUser) {
    console.log(req.user.id);
    return this.deploymentService.getAllDeploymnetVersions(req.user.id);
  }
}
