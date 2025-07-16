/*

flow will be when code is pushed to github, github will call this endpoint 

we are gonna verify this using the signature and secret
*/

import {
  Controller,
  Post,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WebhookService } from '../service/webhook.service';
import { PushEventPayloadDto } from '../dto/pushEventPayload.dto';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebHook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('x-github-event') event: string,
    @Headers('x-hub-signature-256') signature: string,
  ) {
    try {
      const rawBody = req.body as Buffer;
      console.log('raw body : ', rawBody);
      const parsedPayload = JSON.parse(
        rawBody.toString(),
      ) as PushEventPayloadDto;

      // GitHub sends 'ping' event after webhook is created
      if (event === 'ping') {
        return res.status(200).json({ status: 'pong' });
      }

      // Fail if signature is missing
      if (!signature) {
        return res.status(400).json({ error: 'Missing signature' });
      }

      const isValid = this.webhookService.verifySignature(
        parsedPayload,
        signature,
      );

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const result = await this.webhookService.processPayload(parsedPayload);
      return res.status(200).json(result);
    } catch (error) {
      console.error('[WEBHOOK_ERROR]', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

/*
when the webhook is first time registered it sends a ping message to the endpoint to check if it is reachable or not.
that ping message can not and should not create any problem with redeployment logic. 

I will have to manually build and deploy this from scratch
*/
