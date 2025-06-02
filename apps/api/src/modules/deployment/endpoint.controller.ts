import {
  Controller,
  HttpStatus,
  Body,
  Post,
  UseGuards,
  HttpCode,
  Delete,
  Param,
  Patch,
  Get,
} from '@nestjs/common';
import { EndpointService } from './endpoint.service';
import { FakeGuard } from 'src/guards/fake.guard';
import { CreateEndpointDto } from './dto/endpoint.dto';

@UseGuards(FakeGuard) // TODO: Remove this guard in production
@Controller('endpoint')
export class EndpointController {
  constructor(private readonly endpointService: EndpointService) {}

  // Create a new endpoint for a deployment
  @Post(':deploymentId')
  @HttpCode(HttpStatus.CREATED)
  createEndpoint(
    @Param('deploymentId') deploymentId: string,
    @Body() endpointData: CreateEndpointDto,
  ) {
    // Optionally check user from req.user if needed for auth
    return this.endpointService.createEndpoint(endpointData, deploymentId);
  }

  // Update an existing endpoint by id
  @Patch(':endpointId')
  @HttpCode(HttpStatus.OK)
  updateEndpoint(
    @Param('endpointId') endpointId: string,
    @Body() updateData: Partial<CreateEndpointDto>,
  ) {
    return this.endpointService.updateEndpoint(endpointId, updateData);
  }

  // Delete an endpoint by id
  @Delete(':endpointId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteEndpoint(@Param('endpointId') endpointId: string) {
    return this.endpointService.deleteEndpoint(endpointId);
  }

  // Get all endpoints for a given deployment
  @Get('deployment/:deploymentId')
  @HttpCode(HttpStatus.OK)
  getEndpointsByDeployment(@Param('deploymentId') deploymentId: string) {
    return this.endpointService.getEndpointsByDeploymentId(deploymentId);
  }
}
