import { IsUUID } from 'class-validator';

export class StopMessage {
  readonly type = 'stop';

  @IsUUID()
  deploymentId: string;
}
