// this service will verify the signature that github is only connecting to this endpoint and no one else

/*

check if the branch of change matches for example if a branch x has updated but registerd branch is y no need
and even befoer that auto deploy is enabled 
*/
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeploymentService } from './deployment.service';
import * as crypto from 'crypto';
import { PushEventPayloadDto } from '../dto/pushEventPayload.dto';
import { DeploymentActionService } from './deployment-action.service';

@Injectable()
export class WebhookService {
  constructor(
    private readonly configService: ConfigService,
    private readonly deploymentService: DeploymentService,
    private readonly deploymentActionService: DeploymentActionService,
  ) {}

  // this is to verify the signature from the github to check if github is actually making request to webhook
  private computeSignature(payload: any): string {
    const secret = this.configService.get<string>('GITHUB_WEBHOOK_SECRET')!;
    return (
      'sha256=' +
      crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex')
    );
  }

  verifySignature(payload: any, signature: string): boolean {
    const expected = this.computeSignature(payload);
    return expected === signature;
  }

  async processPayload(payload: PushEventPayloadDto) {
    const repo = payload?.repository?.full_name;
    const branch = payload?.ref?.replace('refs/heads/', '');

    if (!repo || !branch) {
      throw new BadRequestException('Invalid payload');
    }

    // 1. Find the matching deployment
    // two usrname cant be same so if vky/blacktree is deployed
    // thre is no way github will esnd a pyaloyad with that same name even if someone try to impersonate them
    const deployment = await this.getMatchingDeployment(repo, branch);
    if (!deployment) return { status: 'ignored' };

    const redeployPromises: Promise<void>[] = [];

    for (const version of deployment.version) {
      if (version.autoDeploy) {
        redeployPromises.push(
          this.deploymentActionService.redeploy(version.id),
        );
      }
    }
    await Promise.allSettled(redeployPromises);

    console.log(`[WEBHOOK] Triggered redeployment for ${repo}:${branch}`);
    return { status: 'redeployed' };
  }

  // this will find the deployment ad check if this can be actually triggered but here is a catch. If a
  private async getMatchingDeployment(repo: string, branch: string) {
    const deployment = await this.deploymentService.findByRepoAndBranch(
      repo,
      branch,
    );

    if (!deployment) {
      console.log(`[WEBHOOK] No matching deployment for ${repo}:${branch}`);
      return null;
    }

    return deployment;
  }
}
