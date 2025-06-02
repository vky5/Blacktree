import {
  Controller,
  HttpStatus,
  Req,
  Body,
  Post,
  UseGuards,
  HttpCode,
  Delete,
  Param,
} from '@nestjs/common';
import { DeploymentService } from './deployment.service';
// import { JWTClerkGuard } from 'src/guards/jwt-clerk.guard';
import { CreateDeploymentDTO } from './dto/deployment.dto';
import { FakeGuard } from 'src/guards/fake.guard';
import { RequestWithUser } from 'src/utils/types/RequestWithUser.interface';

// @UseGuards(JWTClerkGuard) // for restricting all routes guard access to authenticated users
@UseGuards(FakeGuard) //TODO remove this guard in production
@Controller('deployment')
export class DeploymentController {
  constructor(private deploymentService: DeploymentService) {}

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

  // route to update an existing deployment (handle status through service layer)
  @Post(':deploymentId')
  @HttpCode(HttpStatus.OK)
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
  deleteDeployment(@Param('deploymentId') deploymentId: string) {
    return this.deploymentService.deleteDeployment(deploymentId);
  }
}

/*
- [x] Route to create a new deployment
- [x] route to add endpoints 
- [ ] route to update endpoints
- [ ] route to delete endpoints 
- [x] route to update deployment fields
*/
