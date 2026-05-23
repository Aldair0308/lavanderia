import { Controller, Post, Body, Headers, HttpCode } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly service: WhatsappService) {}

  @Post('webhook')
  @HttpCode(200)
  async webhook(@Headers('x-openwa-signature') _signature: string, @Body() body: any) {
    console.log('[Webhook] Received body:', JSON.stringify(body));
    await this.service.handleIncoming(body);
    return { received: true };
  }
}
