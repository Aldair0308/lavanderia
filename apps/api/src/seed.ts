import dataSource from './data-source';
import { Customer } from './entities/Customer';
import { Order } from './entities/Order';
import { OrderStatus } from './entities/OrderStatus';
import { OrderItem } from './entities/OrderItem';
import { WhatsappConversation } from './entities/WhatsappConversation';
import { Campaign, CampaignStatus } from './entities/Campaign';
import { Settings } from './entities/Settings';

async function run() {
  await dataSource.initialize();
  const customerRepo = dataSource.getRepository(Customer);
  const orderRepo = dataSource.getRepository(Order);
  const conversationRepo = dataSource.getRepository(WhatsappConversation);
  const campaignRepo = dataSource.getRepository(Campaign);
  const settingsRepo = dataSource.getRepository(Settings);

  // Create customers
  const customers: Customer[] = [];
  for (let i = 1; i <= 3; i++) {
    const cust = customerRepo.create({
      name: `Cliente ${i}`,
      phone_whatsapp: `5200000000${i}`,
      address: `Calle ${i} #${i}`,
      email: `cliente${i}@example.com`,
      tags: [],
    });
    await customerRepo.save(cust);
    customers.push(cust);
  }

  // Create orders with varying states
  const statuses = [
    OrderStatus.PENDIENTE,
    OrderStatus.RECOLECTANDO,
    OrderStatus.EN_PROCESO,
    OrderStatus.LISTO,
    OrderStatus.COMPLETADO,
  ];
  for (let i = 0; i < 5; i++) {
    const order = orderRepo.create({
      customer: customers[i % customers.length],
      status: statuses[i % statuses.length],
      service_type: 'Lavado normal',
      quantity_kg: 5 + i,
      notes: `Nota del pedido ${i + 1}`,
      pickup_address: customers[i % customers.length].address || 'Dirección desconocida',
      total_price: (10 + i) * 5,
    });
    // Add items
    order.items = [];
    const item = new OrderItem();
    item.item_type = 'Camisa';
    item.quantity = 2 + i;
    item.price_per_unit = 2.5;
    order.items.push(item);
    await orderRepo.save(order);
  }

  // Create a conversation and message
  const conv = conversationRepo.create({
    customer: customers[0],
    is_agent_active: true,
    needs_human: false,
  });
  await conversationRepo.save(conv);

  // Create a campaign placeholder
  const campaign = campaignRepo.create({
    name: 'Campaña Reactivación',
    message_template: 'Hola {nombre}, te extrañamos.',
    target_segment: 'inactivo',
    status: CampaignStatus.DRAFT,
    
  });
  await campaignRepo.save(campaign);

  // Populate settings with placeholder values
  const placeholders = [
    { key: 'business_name', value: 'Lavandería Demo' },
    { key: 'business_hours', value: 'Lun-Vie 8:00-18:00' },
    { key: 'pickup_zones', value: 'Zona 1, Zona 2' },
    { key: 'services_catalog', value: JSON.stringify({ Lavado: 24, Secado: 18, Planchado: 32, 'Paquete completo': 55 }) },
    { key: 'agent_active', value: 'true' },
  ];
  for (const s of placeholders) {
    await settingsRepo.save(settingsRepo.create(s));
  }

  console.log('Seed data inserted');
  await dataSource.destroy();
}

run().catch((err) => {
  console.error('Error seeding data', err);
});
