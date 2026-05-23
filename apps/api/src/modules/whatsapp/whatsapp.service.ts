import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsappConversation } from '../../entities/WhatsappConversation';
import { WhatsappMessage, MessageDirection } from '../../entities/WhatsappMessage';
import axios from 'axios';
import { AgentService } from '../agent/agent.service';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly openwaUrl = process.env.OPENWA_API_URL || '';
  private readonly openwaKey = process.env.OPENWA_API_KEY || '';

  constructor(
    @InjectRepository(WhatsappConversation) private readonly convRepo: Repository<WhatsappConversation>,
    @InjectRepository(WhatsappMessage) private readonly msgRepo: Repository<WhatsappMessage>,
    @Inject(forwardRef(() => AgentService))
    private readonly agentService: AgentService,
  ) {}


  async handleIncoming(payload: any): Promise<void> {
    console.log('[WhatsappService] handleIncoming payload:', JSON.stringify(payload));
    let from = payload.from || '';
    from = from.replace('@c.us', '').replace(/\D/g, '');
    if (!from.startsWith('52') && from.length === 10) {
      from = '52' + from;
    }
    const body = payload.body || payload.text || '';
    if (!from || !body) {
      this.logger.warn('Missing from or body in webhook payload');
      return;
    }
    console.log(`[WhatsappService] Looking for customer with phone: ${from}`);
    const conv = await this.convRepo.findOne({
      where: { customer: { phone_whatsapp: from } },
      relations: ['customer'],
    });
    if (!conv) {
      this.logger.warn(`Conversation from unknown number ${from}`);
      return;
    }
    console.log(`[WhatsappService] Found conversation for ${conv.customer.name}`);
    const message = this.msgRepo.create({
      conversation: conv,
      direction: MessageDirection.INBOUND,
      content: body,
      is_automated: false,
    });
    await this.msgRepo.save(message);
    console.log(`[WhatsappService] Saved message, calling agent...`);
    await this.agentService.processMessage(conv.id, body);
  }

  async sendMessage(to: string, text: string, isAutomated = true): Promise<void> {
    let phone = to.replace('@c.us', '').replace(/\D/g, '');
    if (!phone.startsWith('52') && phone.length === 10) {
      phone = '52' + phone;
    }
    try {
      await axios.post(
        `${this.openwaUrl}/sendMessage`,
        { chatId: `${phone}@c.us`, text },
        { headers: { Authorization: `Bearer ${this.openwaKey}` }, timeout: 15000 },
      );
    } catch (e) {
      this.logger.error(`Failed to send WhatsApp message to ${phone}: ${(e as Error).message}`);
    }
    const conv = await this.convRepo.findOne({
      where: { customer: { phone_whatsapp: phone } },
      relations: ['customer'],
    });
    if (conv) {
      const msg = this.msgRepo.create({
        conversation: conv,
        direction: MessageDirection.OUTBOUND,
        content: text,
        is_automated: isAutomated,
      });
      await this.msgRepo.save(msg);
    }
  }
}
