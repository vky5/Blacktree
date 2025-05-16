import { Module } from '@nestjs/common';
import { DeploymentController } from './deployment.controller';
import { Service } from './.service';

@Module({
  controllers: [DeploymentController],
  providers: [Service]
})
export class DeploymentModule {}
