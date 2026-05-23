import { Controller, Post, Body } from '@nestjs/common';
import { AgentService } from './agent.service';

@Controller('agent')
export class AgentController {
  constructor(private readonly service: AgentService) {}

  /**
   * Endpoint called by the WhatsApp webhook (or any client) to process a message
   * through the DeepSeek agent.
   *
   * Body example: { conversationId: string, text: string }
   */
  @Post('message')
  async handleMessage(
    @Body('conversationId') conversationId: string,
    @Body('text') text: string,
  ): Promise<{ reply: string }> {
    const reply = await this.service.processMessage(conversationId, text);
    return { reply };
  }
}
