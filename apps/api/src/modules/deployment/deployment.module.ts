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
import { DeploymentVersion } from './entities/deployment-version.entity';
import { DeploymentActionsController } from './deployment-actions.controller';
import { DeploymentActionService } from './deployment-action.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deployment, Endpoint]),
    UsersModule,
    MessagingQueueModule,
    DeploymentVersion,
  ],
  controllers: [DeploymentController, DeploymentActionsController],
  providers: [
    DeploymentService,
    EndpointService,
    DeploymentOwnershipGuard,
    DeploymentActionService,
  ],
})
export class DeploymentModule {}
