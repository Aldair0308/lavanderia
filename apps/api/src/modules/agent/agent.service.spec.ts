import { Test, TestingModule } from '@nestjs/testing';
import { AgentService } from './agent.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';


import { getRepositoryToken } from '@nestjs/typeorm';
import { WhatsappConversation } from '../../entities/WhatsappConversation';
import { Settings } from '../../entities/Settings';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { OrdersService } from '../orders/orders.service';

// Helpers to create mock deepseek responses
function mockDeepSeekResponse(messageContent: string) {
  return of({
    data: {
      choices: [{ message: { content: messageContent } }],
    },
  });
}

describe('AgentService', () => {
  let service: AgentService;
  let httpService: HttpService;

  let whatsappService: WhatsappService;
  let ordersService: OrdersService;

  const mockConversation = {
    id: 'conv-123',
    customer: { id: 'cust-1', name: 'Juan', phone_whatsapp: '521234567890' },
    needs_human: false,
    is_agent_active: true,
    last_message_at: new Date(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentService,
        {
          provide: HttpService,
          useValue: { post: jest.fn() },
        },

          {
            provide: getRepositoryToken(WhatsappConversation),
            useValue: {
              findOne: jest.fn().mockResolvedValue(mockConversation),
              save: jest.fn().mockImplementation((c) => Promise.resolve(c)),
            },
          },
          {
            provide: getRepositoryToken(Settings),
            useValue: {
              find: jest.fn().mockResolvedValue([]), // no settings needed for tests
            },
          },
        {
          provide: WhatsappService,
          useValue: { sendMessage: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: OrdersService,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: 'order-99' }),
            findAll: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<AgentService>(AgentService);
    httpService = module.get<HttpService>(HttpService);
    whatsappService = module.get<WhatsappService>(WhatsappService);
    ordersService = module.get<OrdersService>(OrdersService);
  });

  it('should create order when DeepSeek returns create_order action', async () => {
    const deepSeekMsg = JSON.stringify({
      action: 'create_order',
      data: {
        service_type: 'lavado',
        pickup_address: 'Calle 123',
        notes: 'sin perfume',
        pickup_date: '2024-01-01T10:00:00.000Z',
      },
    });
    (httpService.post as jest.Mock).mockReturnValueOnce(
      mockDeepSeekResponse(deepSeekMsg),
    );

    const result = await service.processMessage('conv-123', 'Quiero lavar');

    expect(ordersService.create).toHaveBeenCalled();
    expect(result).toContain('Pedido creado con ID');
    expect(whatsappService.sendMessage).toHaveBeenCalled();
  });

  it('should return __ESCALAR__ and mark conversation as needing human', async () => {
    const deepSeekMsg = '__ESCALAR__';
    (httpService.post as jest.Mock).mockReturnValueOnce(
      mockDeepSeekResponse(deepSeekMsg),
    );

    const result = await service.processMessage('conv-123', 'Necesito ayuda');
    expect(result).toBe('__ESCALAR__');
    expect(mockConversation.needs_human).toBe(true);
  });

  it('should send plain text reply when DeepSeek returns normal text', async () => {
    const plainText = 'Hola, ¿en qué puedo ayudarle?';
    (httpService.post as jest.Mock).mockReturnValueOnce(
      mockDeepSeekResponse(plainText),
    );

    const result = await service.processMessage('conv-123', 'Hola');
    expect(result).toBe(plainText);
    expect(whatsappService.sendMessage).toHaveBeenCalledWith(
      mockConversation.customer.phone_whatsapp,
      plainText,
      true,
    );
  });
});
