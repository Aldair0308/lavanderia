import { Controller, Post, Get, Patch, Param, Body, Headers, HttpCode, UseGuards, UnauthorizedException } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly service: WhatsappService) {}

  @Post('webhook')
  @HttpCode(200)
  async webhook(@Headers('authorization') auth: string, @Body() body: any) {
    const expectedKey = process.env.OPENWA_API_KEY || 'dev-key-change-me';
    if (!auth || auth !== `Bearer ${expectedKey}`) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
    await this.service.handleIncoming(body);
    return { received: true };
  }

  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  async listConversations() {
    return this.service.findConversations();
  }

  @Get('conversations/:id/messages')
  @UseGuards(JwtAuthGuard)
  async getMessages(@Param('id') id: string) {
    return this.service.findMessages(id);
  }

  @Post('conversations/:id/messages')
  @UseGuards(JwtAuthGuard)
  async sendMessage(@Param('id') id: string, @Body('text') text: string) {
    if (!text) throw new Error('text is required');
    return this.service.sendManualMessage(id, text);
  }

  @Patch('conversations/:id/agent')
  @UseGuards(JwtAuthGuard)
  async toggleAgent(@Param('id') id: string, @Body('active') active: boolean) {
    return this.service.toggleAgent(id, active);
  }
}
