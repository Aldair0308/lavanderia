import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Settings } from '../../entities/Settings';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { WhatsappConversation } from '../../entities/WhatsappConversation';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private readonly deepseekUrl = process.env.DEEPSEEK_API_URL || '';
  private readonly deepseekKey = process.env.DEEPSEEK_API_KEY || '';
  private readonly deepseekModel = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

  constructor(
    private readonly http: HttpService,
    @InjectRepository(Settings) private readonly settingsRepo: Repository<Settings>,
    @InjectRepository(WhatsappConversation) private readonly convRepo: Repository<WhatsappConversation>,
    @Inject(forwardRef(() => WhatsappService))
    private readonly whatsappService: WhatsappService,
    private readonly ordersService: OrdersService,
  ) {}

  /** Load all settings */
  private async getSettings(): Promise<Record<string, any>> {
    const all = await this.settingsRepo.find();
    return all.reduce((acc, cur) => {
      try {
        acc[cur.key] = JSON.parse(cur.value);
      } catch {
        acc[cur.key] = cur.value;
      }
      return acc;
    }, {} as Record<string, any>);
  }

  /** Mark conversation as needing human */
  private async markNeedsHuman(conv: WhatsappConversation): Promise<void> {
    conv.needs_human = true;
    await this.convRepo.save(conv);
  }

  /** Send reply via WhatsApp */
  private async sendReply(to: string, text: string): Promise<void> {
    await this.whatsappService.sendMessage(to, text, true);
  }

  /** Execute an action defined by the agent */
  private async executeAction(actionObj: any, conv: WhatsappConversation): Promise<string> {
    const { action, data } = actionObj;
    switch (action) {
      case 'create_order': {
        try {
          const dto: any = {
            customer_name: conv.customer.name,
            customer_phone: conv.customer.phone_whatsapp,
            customer_email: conv.customer.email,
            service_type: data.service_type || 'Lavado',
            quantity_kg: data.quantity_kg || 1,
            pickup_address: data.pickup_address || conv.customer.address || 'No especificada',
            notes: data.notes,
            total_price: data.total_price,
          };
          if (data.pickup_date) {
            dto.pickup_date = data.pickup_date;
          }
          const order = await this.ordersService.create(dto);
          return `Pedido creado con ID ${order.id} para ${conv.customer.name}.`;
        } catch (e) {
          this.logger.error('Error creando pedido', e);
          return 'Error al crear el pedido.';
        }
      }
      case 'get_order_status': {
        try {
          const allOrders = await this.ordersService.findAll();
          const customerOrders = allOrders.filter(o => o.customer?.id === conv.customer.id);
          if (customerOrders.length === 0) {
            return 'No hay pedidos registrados para este cliente.';
          }
          const latest = customerOrders.reduce((a, b) => (a.created_at > b.created_at ? a : b));
          return `El último pedido (ID ${latest.id}) está en estado: ${latest.status}.`;
        } catch (e) {
          this.logger.error('Error obteniendo estado del pedido', e);
          return 'Error al obtener el estado del pedido.';
        }
      }
      case 'get_prices': {
        const settings = await this.getSettings();
        const catalog = settings['services_catalog'] || {};
        return `Catálogo de servicios: ${JSON.stringify(catalog)}`;
      }
      case 'request_human': {
        await this.markNeedsHuman(conv);
        return '__ESCALAR__';
      }
      default:
        return 'Acción no reconocida.';
    }
  }

  /** Main processing method */
  async processMessage(conversationId: string, incomingText: string): Promise<string> {
    const conv = await this.convRepo.findOne({ where: { id: conversationId }, relations: ['customer'] });
    if (!conv) throw new Error('Conversation not found');
    const settings = await this.getSettings();
    this.logger.debug('Processing message', { conversationId, incomingText, settingsKeys: Object.keys(settings) });

    const systemPrompt = `
Eres parte del equipo de una lavandería y atiendes el WhatsApp del negocio.

PERSONALIDAD:
- Respondes como una persona real, no como un bot
- Tono: directo, amable, informal pero respetuoso. Como alguien que conoce al cliente de confianza
- Español mexicano natural

REGLAS DE FORMATO — sin excepciones:
- Máximo 2 a 3 líneas por mensaje
- Sin listas numeradas ni bullets
- Sin asteriscos ni markdown de ningún tipo
- Emojis solo si el cliente los usó primero en este chat, máximo 1
- Nunca uses seguidas las palabras: "perfecto", "excelente", "con gusto", "claro que sí"
- Nunca menciones que eres automatizado, un bot, o una IA

CUANDO NO PUEDAS RESOLVER ALGO:
Responde únicamente con el texto exacto: __ESCALAR__
Úsalo cuando: el cliente esté molesto, la pregunta sea muy específica de un pedido que no encuentras, o cualquier situación donde necesites a una persona real.

CONTEXTO QUE RECIBIRÁS EN CADA MENSAJE:
- Datos del cliente (nombre, historial)
- Últimos 10 mensajes de la conversación
- Catálogo de servicios y precios actuales
- Horarios del negocio

ACCIONES DISPONIBLES:
- create_order
- get_order_status
- get_prices
- request_human
`;

    const payload = {
      model: this.deepseekModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: incomingText },
      ],
    };
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${this.deepseekKey}` };
    const response = await firstValueFrom(this.http.post(`${this.deepseekUrl}/chat/completions`, payload, { headers }));
    const assistantMsg = response.data?.choices?.[0]?.message?.content?.trim();
    if (!assistantMsg) return '';

    // Escalation token
    if (assistantMsg.includes('__ESCALAR__')) {
      await this.markNeedsHuman(conv);
      return '__ESCALAR__';
    }

    // Try JSON action
    try {
      const parsed = JSON.parse(assistantMsg);
      if (parsed && parsed.action) {
        const result = await this.executeAction(parsed, conv);
        if (result === '__ESCALAR__') return '__ESCALAR__';
        await this.sendReply(conv.customer.phone_whatsapp, result);
        return result;
      }
    } catch (e) {
      // Not JSON, continue
    }

    // Plain text reply
    await this.sendReply(conv.customer.phone_whatsapp, assistantMsg);
    return assistantMsg;
  }
}
