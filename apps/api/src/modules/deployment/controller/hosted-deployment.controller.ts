import {
  Controller,
  Get,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  Param,
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
  getAllDeployedInstances(@Req() req: RequestWithUser) {
    console.log(req.user.id);
    return this.deploymentService.getAllLatestDeploymentVersionOfProject(
      req.user.id,
    );
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  getAllDeploymentVersionsOfID(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    return this.deploymentService.getAllDeploymentVersionIDFromDeployment(
      req.user.id,
      id,
    );
  }
}
