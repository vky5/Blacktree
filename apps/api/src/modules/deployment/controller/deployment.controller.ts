import {
  Controller,
  HttpStatus,
  Req,
  Body,
  Post,
  Get,
  UseGuards,
  HttpCode,
  Delete,
  Param,
  Patch,
} from '@nestjs/common';
import { DeploymentService } from '../service/deployment.service';
import { JWTClerkGuard } from 'src/guards/jwt-clerk.guard';
import { CreateDeploymentDTO } from '../dto/deployment.dto';
import { RequestWithUser } from 'src/utils/types/RequestWithUser.interface';
import { Serialize } from 'src/interceptors/serialize-interceptor';
import { OwnershipGuard } from 'src/guards/ownership.guard';
import { CheckOwnership } from 'src/guards/check-ownership.decorator';
import { ShowDeploymentDTO } from '../dto/show-deployment.dto';

@UseGuards(JWTClerkGuard, OwnershipGuard) // for restricting all routes guard access to authenticated users
@Controller('deployment')
export class DeploymentController {
  constructor(private deploymentService: DeploymentService) {}

  @Get('/user')
  @HttpCode(HttpStatus.OK)
  @Serialize(ShowDeploymentDTO)
  getUsersDeployment(@Req() req: RequestWithUser) {
    return this.deploymentService.getDeploymentsCreatedByUser(req.user.id);
  }

  @Get('/public')
  @HttpCode(HttpStatus.OK)
  @Serialize(ShowDeploymentDTO)
  getAllPublicDeployments() {
    return this.deploymentService.getAllPublicDeployment();
  }

  // route to create a new deployment
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createDeployment(
    @Body() deployedBody: CreateDeploymentDTO,
    @Req() req: RequestWithUser,
  ) {
    // Extract user ID from request
    const userId = req.user.id;

    // Call service to create deployment
    return this.deploymentService.createDeployment(deployedBody, userId);
  }

  // getting the deployment data from the db using id
  // @UseGuards(DeploymentOwnershipGuard)
  @Get(':deploymetId')
  @HttpCode(HttpStatus.OK)
  @CheckOwnership('deployment')
  getDeployment(@Param('deploymetId') deploymentId: string) {
    return this.deploymentService.deploymentInfo(deploymentId);
  }

  // route to update an existing deployment (handle status through service layer)
  @Patch(':deploymentId')
  @HttpCode(HttpStatus.OK)
  @CheckOwnership('deployment')
  updateDeployment(
    @Param('deploymentId') deploymentId: string,
    @Body() updateData: Partial<CreateDeploymentDTO>,
  ) {
    // Call service to update deployment
    return this.deploymentService.updateDeployment(deploymentId, updateData);
  }

  // route to delete the deployment
  @Delete(':deploymentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @CheckOwnership('deployment')
  deleteDeployment(@Param('deploymentId') deploymentId: string) {
    return this.deploymentService.deleteDeployment(deploymentId);
  }
}
