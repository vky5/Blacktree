import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { DeploymentModule } from '../deployment/deployment.module';
import { ResourceServiceMapProvider } from 'src/guards/resource-service-map.provider';

@Module({
  imports: [UsersModule, DeploymentModule],
  providers: [ResourceServiceMapProvider],
  exports: [ResourceServiceMapProvider], // no significant reason but if we need to use it elsewhere
})
export class CoreModule {}

// the whole purpose of core module is to act as a bridge between UserService and deploymentservice because we cant import them one in another because that
// would cause circular dependency issue instead we created a common module that will inject the copy of both service and give us factory to be used in guard
