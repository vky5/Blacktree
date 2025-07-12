import { Module } from '@nestjs/common';
import { AwsController } from './aws.controller';
import { AwsService } from './aws.service';

@Module({
  controllers: [AwsController],
  providers: [AwsService]
})
export class AwsModule {}
