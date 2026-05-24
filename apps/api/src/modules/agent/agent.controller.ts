import { Controller, Post, Body } from '@nestjs/common';
import { AgentService } from './agent.service';

@Controller('agent')
export class AgentController {
  constructor(private readonly service: AgentService) {}

  @Post('message')
  async handleMessage(
    @Body('conversationId') conversationId: string,
    @Body('text') text: string,
  ): Promise<{ reply: string }> {
    const reply = await this.service.processBatch(conversationId, [text], false);
    return { reply };
  }
}
