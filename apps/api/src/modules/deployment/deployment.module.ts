import { Module } from '@nestjs/common';
import { DeploymentController } from './deployment.controller';
import { DeploymentService } from './deployment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deployment } from './entities/deployment.entity';
import { Endpoint } from './entities/endpoint.entity';
import { EndpointService } from './endpoint.service';

@Module({
  imports: [TypeOrmModule.forFeature([Deployment, Endpoint])],
  controllers: [DeploymentController],
  providers: [DeploymentService, EndpointService],
})
export class DeploymentModule {}
