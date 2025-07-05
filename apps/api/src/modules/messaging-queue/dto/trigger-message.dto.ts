import { IsUUID } from 'class-validator';

export class TriggerDeployment {
  readonly type = 'trigger';

  @IsUUID()
  deploymentId: string;
}
