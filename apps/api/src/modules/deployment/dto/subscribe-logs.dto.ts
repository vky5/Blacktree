// dto/subscribe-logs.dto.ts
import { IsString } from 'class-validator';

export class SubscribeLogsDto {
  @IsString()
  deploymentId: string;
}
