import { Injectable, Logger, Inject, forwardRef, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsappConversation } from '../../entities/WhatsappConversation';
import { WhatsappMessage, MessageDirection } from '../../entities/WhatsappMessage';
import axios from 'axios';
import { AgentService } from '../agent/agent.service';
import { CustomersService } from '../customers/customers.service';
import { WhatsappMessageAnalyzer } from './whatsapp-message-analyzer.service';
import { WhatsappConversationBuffer } from './whatsapp-conversation-buffer.service';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly openwaUrl = process.env.OPENWA_API_URL || '';
  private readonly openwaKey = process.env.OPENWA_API_KEY || '';

  constructor(
    @InjectRepository(WhatsappConversation) private readonly convRepo: Repository<WhatsappConversation>,
    @InjectRepository(WhatsappMessage) private readonly msgRepo: Repository<WhatsappMessage>,
    @Inject(forwardRef(() => AgentService))
    private readonly agentService: AgentService,
    private readonly customersService: CustomersService,
    private readonly messageAnalyzer: WhatsappMessageAnalyzer,
    private readonly conversationBuffer: WhatsappConversationBuffer,
  ) {}

  onModuleInit() {
    this.conversationBuffer.onBatchReady = async (convId, messages, remoteJid, isNudge) => {
      await this.processBatch(convId, messages, remoteJid, isNudge);
    };
  }

  private normalizePhone(raw: string): string {
    let phone = raw.replace('@c.us', '').replace('@s.whatsapp.net', '').replace(/\D/g, '');
    if (!phone.startsWith('52') && phone.length === 10) {
      phone = '52' + phone;
    }
    return phone;
  }

  async handleIncoming(payload: any): Promise<void> {
    console.log('[WhatsappService] handleIncoming payload:', JSON.stringify(payload));
    let from = payload.from || '';
    const remoteJid: string | null = payload.remoteJid || null;
    from = this.normalizePhone(from);
    const body = payload.body || payload.text || '';
    if (!from || !body) {
      this.logger.warn('Missing from or body in webhook payload');
      return;
    }

    let conv = await this.convRepo.findOne({
      where: { customer: { phone_whatsapp: from } },
      relations: ['customer'],
    });

    const shouldUpdateJid = remoteJid && (!conv || conv.remote_jid !== remoteJid);

    if (!conv) {
      let customer = await this.customersService.findByPhone(from);
      if (!customer) {
        const name = `Cliente +52 ${from.slice(2, 4)} XXX XX ${from.slice(-2)}`;
        customer = await this.customersService.create({
          name,
          phone_whatsapp: from,
        });
        this.logger.log(`Created new customer ${customer.id} for phone ${from}`);
      }
      conv = this.convRepo.create({ customer });
      if (remoteJid) conv.remote_jid = remoteJid;
      conv = await this.convRepo.save(conv);
      this.logger.log(`Created new conversation ${conv.id} for ${customer.name}`);
    } else if (shouldUpdateJid) {
      conv.remote_jid = remoteJid;
      await this.convRepo.save(conv);
      this.logger.log(`Updated remote_jid for conv ${conv.id}: ${remoteJid}`);
    }

    console.log(`[WhatsappService] Conversation ${conv.id} for ${conv.customer.name}`);
    const message = this.msgRepo.create({
      conversation: conv,
      direction: MessageDirection.INBOUND,
      content: body,
      is_automated: false,
    });
    await this.msgRepo.save(message);
    conv.last_message_at = new Date();
    await this.convRepo.save(conv);

    if (conv.is_agent_active && !conv.needs_human) {
      const analysis = this.messageAnalyzer.analyze(body);
      console.log(`[WhatsappService] Buffer push (${analysis.category}, delay=${analysis.bufferDelayMs}ms)`);
      this.conversationBuffer.push(conv.id, conv.remote_jid || `${from}@s.whatsapp.net`, body, analysis);
    } else {
      console.log(`[WhatsappService] Agent inactive or needs human, skipping auto-reply`);
    }
  }

  private async processBatch(convId: string, messages: string[], remoteJid: string, isNudge: boolean): Promise<void> {
    const conv = await this.convRepo.findOne({
      where: { id: convId },
      relations: ['customer'],
    });
    if (!conv) return;

    // Send typing indicator
    await this.sendTyping(remoteJid, 5_000);

    // Get agent response
    const reply = await this.agentService.processBatch(convId, messages, isNudge);
    if (!reply || reply === '__ESCALAR__') return;

    // Simulate human typing time based on response length
    const typingMs = Math.max(1_000, reply.split(/\s+/).length * 80);
    await this.sendTyping(remoteJid, typingMs);
    await this.delay(typingMs);

    // Send the actual message
    await axios.post(
      `${this.openwaUrl}/sendMessage`,
      { chatId: remoteJid, text: reply },
      { headers: { Authorization: `Bearer ${this.openwaKey}` }, timeout: 15000 },
    );

    const msg = this.msgRepo.create({
      conversation: conv,
      direction: MessageDirection.OUTBOUND,
      content: reply,
      is_automated: true,
    });
    await this.msgRepo.save(msg);
    conv.last_message_at = new Date();
    await this.convRepo.save(conv);
  }

  private async sendTyping(chatId: string, durationMs: number): Promise<void> {
    try {
      await axios.post(
        `${this.openwaUrl}/typing`,
        { chatId, duration: durationMs },
        { headers: { Authorization: `Bearer ${this.openwaKey}` }, timeout: 5000 },
      );
    } catch {
      // Typing indicator is best-effort
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async sendMessage(to: string, text: string, isAutomated = true): Promise<void> {
    const phone = this.normalizePhone(to);
    const conv = await this.convRepo.findOne({
      where: { customer: { phone_whatsapp: phone } },
      relations: ['customer'],
    });
    const chatId = conv?.remote_jid || `${phone}@s.whatsapp.net`;
    await axios.post(
      `${this.openwaUrl}/sendMessage`,
      { chatId, text },
      { headers: { Authorization: `Bearer ${this.openwaKey}` }, timeout: 15000 },
    );
    if (conv) {
      const msg = this.msgRepo.create({
        conversation: conv,
        direction: MessageDirection.OUTBOUND,
        content: text,
        is_automated: isAutomated,
      });
      await this.msgRepo.save(msg);
      conv.last_message_at = new Date();
      await this.convRepo.save(conv);
    }
  }

  async findConversations(): Promise<any[]> {
    const convs = await this.convRepo.find({
      relations: ['customer'],
      order: { last_message_at: 'DESC' },
    });
    const result: any[] = [];
    for (const conv of convs) {
      const lastMsg = await this.msgRepo.findOne({
        where: { conversation: { id: conv.id } },
        order: { timestamp: 'DESC' },
      });
      const unread = await this.msgRepo.count({
        where: { conversation: { id: conv.id }, direction: MessageDirection.INBOUND, is_automated: false },
      });
      result.push({
        id: conv.id,
        customer: conv.customer,
        is_agent_active: conv.is_agent_active,
        needs_human: conv.needs_human,
        last_message_at: conv.last_message_at,
        last_message: lastMsg?.content || null,
        unread_count: unread,
      });
    }
    return result;
  }

  async findMessages(conversationId: string): Promise<WhatsappMessage[]> {
    return this.msgRepo.find({
      where: { conversation: { id: conversationId } },
      order: { timestamp: 'ASC' },
    });
  }

  async sendManualMessage(conversationId: string, text: string): Promise<WhatsappMessage> {
    const conv = await this.convRepo.findOne({
      where: { id: conversationId },
      relations: ['customer'],
    });
    if (!conv) throw new Error('Conversation not found');
    this.conversationBuffer.flush(conv.id);
    await this.sendMessage(conv.customer.phone_whatsapp, text, false);
    const msg = await this.msgRepo.findOne({
      where: { conversation: { id: conversationId } },
      order: { timestamp: 'DESC' },
    });
    if (!msg) throw new Error('Failed to save message');
    return msg;
  }

  async toggleAgent(conversationId: string, active: boolean): Promise<WhatsappConversation> {
    const conv = await this.convRepo.findOne({ where: { id: conversationId } });
    if (!conv) throw new Error('Conversation not found');
    conv.is_agent_active = active;
    if (active) conv.needs_human = false;
    return this.convRepo.save(conv);
  }
}
