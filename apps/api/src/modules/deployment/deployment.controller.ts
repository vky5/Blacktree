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
import { DeploymentService } from './deployment.service';
// import { JWTClerkGuard } from 'src/guards/jwt-clerk.guard';
import { CreateDeploymentDTO } from './dto/deployment.dto';
import { FakeGuard } from 'src/guards/fake.guard';
import { RequestWithUser } from 'src/utils/types/RequestWithUser.interface';
import { DeploymentOwnershipGuard } from './guards/deployment-ownership.guard';

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

  // getting the deployment data from the db using id
  // @UseGuards(DeploymentOwnershipGuard)
  @Get(':deploymetId')
  @HttpCode(HttpStatus.OK)
  getDeployment(@Param('deploymetId') deploymentId: string) {
    return this.deploymentService.deploymentInfo(deploymentId);
  }

  // route to update an existing deployment (handle status through service layer)
  @Patch(':deploymentId')
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

  // build deployment by id
  @UseGuards(DeploymentOwnershipGuard)
  @Post('/build/:deploymentId')
  @HttpCode(HttpStatus.OK)
  buildDeployment(@Param('deploymentId') deploymentId: string) {
    return this.deploymentService.buildDeployment(deploymentId);
  }

  // trigger deployment
  @UseGuards(DeploymentOwnershipGuard)
  @Post('/trigger/:deploymentId')
  @HttpCode(HttpStatus.OK)
  triggerDeployment(@Param('deploymentId') deploymentId: string) {
    return this.deploymentService.triggerDeployment(deploymentId);
  }

  // delete deployment image in worker
  @UseGuards(DeploymentOwnershipGuard)
  @Post('/delete/:deploymentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteWorkerDeployment(@Param('deploymentId') deploymentId: string) {
    return this.deploymentService.deleteWorkerDeployment(deploymentId);
  }

  // to halt the running instance
  @UseGuards(DeploymentOwnershipGuard)
  @Post('/stop/:deploymentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  stopWorkerDeployment(@Param('deploymentId') deploymentId: string) {
    return this.deploymentService.stopWorkerDeployment(deploymentId);
  }
}

/*
- [x] Route to create a new deployment
- [x] route to add endpoints 
- [x] route to update endpoints
- [x] route to delete endpoints 
- [x] route to update deployment fields

*/
