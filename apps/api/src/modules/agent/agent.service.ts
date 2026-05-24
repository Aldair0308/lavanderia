import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Settings } from '../../entities/Settings';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { WhatsappConversation } from '../../entities/WhatsappConversation';
import { WhatsappMessage, MessageDirection } from '../../entities/WhatsappMessage';
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
    @InjectRepository(WhatsappMessage) private readonly msgRepo: Repository<WhatsappMessage>,
    private readonly ordersService: OrdersService,
  ) {}

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

  private async markNeedsHuman(conv: WhatsappConversation): Promise<void> {
    conv.needs_human = true;
    await this.convRepo.save(conv);
  }

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

  async processBatch(conversationId: string, messages: string[], isNudge: boolean): Promise<string> {
    const conv = await this.convRepo.findOne({
      where: { id: conversationId },
      relations: ['customer'],
    });
    if (!conv) throw new Error('Conversation not found');

    const settings = await this.getSettings();
    const catalog = settings['services_catalog'] || {};

    const systemPrompt = this.buildSystemPrompt(conv, catalog);

    // Build message history from DB
    const recentMessages = await this.msgRepo.find({
      where: { conversation: { id: conversationId } },
      order: { timestamp: 'ASC' },
      take: 50,
    });

    const historyMessages = recentMessages.slice(0, -messages.length).map((m) => ({
      role: m.direction === MessageDirection.INBOUND ? ('user' as const) : ('assistant' as const),
      content: m.content,
    }));

    const userMessages = messages.map((m) => ({
      role: 'user' as const,
      content: m,
    }));

    let userPrompt: string;
    if (isNudge) {
      userPrompt = `[SOLICITUD DE RECORDATORIO AMABLE]
El cliente dijo que enviaría información pero no lo ha hecho aún.
Genera un recordatorio cordial, como si fueras un vendedor paciente.
No presiones, solo recuerda que estás al pendiente.
Usa el contexto de la conversación para personalizar.

Mensajes del cliente en este ciclo:
${messages.map((m, i) => `${i + 1}. "${m}"`).join('\n')}`;
    } else {
      userPrompt = `Mensajes del cliente en este ciclo:
${messages.map((m, i) => `${i + 1}. "${m}"`).join('\n')}`;
    }

    const payload = {
      model: this.deepseekModel,
      messages: [
        { role: 'system', content: systemPrompt },
        ...historyMessages,
        ...userMessages,
        { role: 'user', content: userPrompt },
      ],
    };

    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${this.deepseekKey}` };
    const response = await firstValueFrom(
      this.http.post(`${this.deepseekUrl}/chat/completions`, payload, { headers }),
    );
    const assistantMsg = response.data?.choices?.[0]?.message?.content?.trim();
    if (!assistantMsg) return '';

    if (assistantMsg.includes('__ESCALAR__')) {
      await this.markNeedsHuman(conv);
      return '__ESCALAR__';
    }

    try {
      const parsed = JSON.parse(assistantMsg);
      if (parsed && parsed.action) {
        const result = await this.executeAction(parsed, conv);
        if (result === '__ESCALAR__') return '__ESCALAR__';
        return result;
      }
    } catch {
      // Not JSON, continue
    }

    return assistantMsg;
  }

  private buildSystemPrompt(conv: WhatsappConversation, catalog: any): string {
    const customerName = conv.customer.name || 'Cliente';
    const customerPhone = conv.customer.phone_whatsapp || '';
    const customerAddress = conv.customer.address || 'no registrada';

    return `
Eres parte del equipo de una lavandería y atiendes el WhatsApp del negocio.

ERES UN SENIOR EN VENTAS con 10+ años de experiencia en atención al cliente y ventas en servicio de lavandería.

PERSONALIDAD:
- Tomas el tiempo del cliente, nunca lo apresuras
- Escuchas activamente: reconoces TODO lo que el cliente dijo ANTES de responder
- Si el cliente ofrece enviar información (dirección, fotos), responde de manera calmada:
  "Perfecto, quedo al pendiente. Cuando la tengas me avisas y programamos tu entrega."
- Usas cierres suaves y naturales: "¿Te parece bien mañana en la mañana?"
- Haces sentir al cliente valorado, no como un número de pedido
- Eres paciente, amable, y sabes retener clientes sin ser insistente

DATOS DEL CLIENTE:
- Nombre: ${customerName}
- Teléfono: ${customerPhone}
- Dirección guardada: ${customerAddress}

SERVICIO DE RECOLECCIÓN A DOMICILIO:
- Disponible SOLO en San Mateo Atenco, Estado de México
- Mínimo 4kg para aplicar
- Horario de recolección: Lunes a Sábado, 9:00 am - 6:00 pm
- Precios base: ${JSON.stringify(catalog)}
- Cuando un cliente muestre interés en recolección a domicilio:
  1. Pregunta cuántos kilos va a lavar
  2. Si son 4kg o más, ofrece el servicio de recolección
  3. Pregunta su dirección (valida que sea zona de cobertura: San Mateo Atenco)
  4. Pregunta día y horario preferido
  5. Sugiere un horario estimado de recolección
  6. Cuando tengas todos los datos, usa create_order para registrar el pedido

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
`.trim();
  }
}
