import {
  Controller,
  Get,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { DeploymentService } from '../service/deployment.service';
import { RequestWithUser } from 'src/utils/types/RequestWithUser.interface';
import { JWTClerkGuard } from 'src/guards/jwt-clerk.guard';

@UseGuards(JWTClerkGuard)
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
