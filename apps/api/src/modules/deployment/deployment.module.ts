import { Module } from '@nestjs/common';
import { DeploymentController } from './controller/deployment.controller';
import { DeploymentService } from './service/deployment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deployment } from './entities/deployment.entity';
import { Endpoint } from './entities/endpoint.entity';
import { EndpointService } from './service/endpoint.service';
import { DeploymentOwnershipGuard } from './guards/deployment-ownership.guard';
import { UsersModule } from '../users/users.module';
import { MessagingQueueModule } from '../messaging-queue/messaging-queue.module';
import { DeploymentVersion } from './entities/deployment-version.entity';
import { DeploymentActionsController } from './controller/deployment-actions.controller';
import { DeploymentActionService } from './service/deployment-action.service';
import { AwsModule } from '../aws/aws.module';
import { WebhookController } from './controller/webhook.controller';
import { WebhookService } from './service/webhook.service';
import HostedDeploymentController from './controller/hosted-deployment.controller';
import { ResourceServiceMapProvider } from 'src/guards/resource-service-map.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deployment, Endpoint, DeploymentVersion]),
    UsersModule,
    MessagingQueueModule,
    AwsModule,
  ],
  controllers: [
    DeploymentController,
    DeploymentActionsController,
    WebhookController,
    HostedDeploymentController,
  ],
  providers: [
    DeploymentService,
    EndpointService,
    DeploymentOwnershipGuard,
    DeploymentActionService,
    WebhookService,
    ResourceServiceMapProvider,
  ],
  exports: [DeploymentService, DeploymentActionService],
})
export class DeploymentModule {}
