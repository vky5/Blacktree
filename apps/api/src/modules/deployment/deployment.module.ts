import { Module } from '@nestjs/common';
import { DeploymentController } from './deployment.controller';
import { DeploymentService } from './deployment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deployment } from './entities/deployment.entity';
import { Endpoint } from './entities/endpoint.entity';
import { EndpointService } from './endpoint.service';
import { DeploymentOwnershipGuard } from './guards/deployment-ownership.guard';
import { UsersModule } from '../users/users.module';
import { MessagingQueueModule } from '../messaging-queue/messaging-queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deployment, Endpoint]),
    UsersModule,
    MessagingQueueModule,
  ],
  controllers: [DeploymentController],
  providers: [DeploymentService, EndpointService, DeploymentOwnershipGuard],
})
export class DeploymentModule {}
