require('ts-node').register({ transpileOnly: true });

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../apps/api/src/app.module';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { WhatsappService } from '../apps/api/src/modules/whatsapp/whatsapp.service';
import { OrdersService } from '../apps/api/src/modules/orders/orders.service';

// Helper to mock DeepSeek response
function mockDeepSeekResponse(messageContent) {
  return of({
    data: {
      choices: [{ message: { content: messageContent } }],
    },
  });
}

describe('Agent E2E', () => {
  let app; // INestApplication
  let httpService; // HttpService
  let whatsappService; // WhatsappService
  let ordersService; // OrdersService

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HttpService)
      .useValue({ post: jest.fn() })
      .overrideProvider(WhatsappService)
      .useValue({ sendMessage: jest.fn().mockResolvedValue(undefined) })
      .overrideProvider(OrdersService)
      .useValue({
        create: jest.fn().mockResolvedValue({ id: 'order-xyz' }),
        findAll: jest.fn().mockResolvedValue([]),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    httpService = moduleFixture.get(HttpService);
    whatsappService = moduleFixture.get(WhatsappService);
    ordersService = moduleFixture.get(OrdersService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should process create_order action end‑to‑end', async () => {
    const deepSeekMsg = JSON.stringify({
      action: 'create_order',
      data: {
        service_type: 'lavado',
        pickup_address: 'Calle 123',
        notes: 'sin perfume',
        pickup_date: '2024-01-01T10:00:00.000Z',
      },
    });
    httpService.post.mockReturnValueOnce(mockDeepSeekResponse(deepSeekMsg));

    const response = await request(app.getHttpServer())
      .post('/agent/message')
      .send({ conversationId: 'conv-123', text: 'Quiero lavar' })
      .expect(201);

    expect(response.body.reply).toContain('Pedido creado con ID');
    expect(ordersService.create).toHaveBeenCalled();
    expect(whatsappService.sendMessage).toHaveBeenCalled();
  });

  it('should return __ESCALAR__ and mark human escalation', async () => {
    httpService.post.mockReturnValueOnce(mockDeepSeekResponse('__ESCALAR__'));
    const response = await request(app.getHttpServer())
      .post('/agent/message')
      .send({ conversationId: 'conv-123', text: 'Ayuda' })
      .expect(201);
    expect(response.body.reply).toBe('__ESCALAR__');
  });
});
