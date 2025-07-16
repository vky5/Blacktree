/*

flow will be when code is pushed to github, github will call this endpoint 

we are gonna verify this using the signature and secret
*/

import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { DeploymentActionService } from '../service/deployment-action.service';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly deploymentActionService: DeploymentActionService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  handleWebHook() {
    return {
      success: true,
    };
  }
}
