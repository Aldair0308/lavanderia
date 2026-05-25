import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../entities/Order';
import { OrderStatus } from '../../entities/OrderStatus';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatusHistory } from '../../entities/OrderStatusHistory';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderStatusHistory)
    private readonly statusHistoryRepo: Repository<OrderStatusHistory>,
    private readonly customersService: CustomersService,
  ) {}

  async findAll(): Promise<Order[]> {
    return this.orderRepo.find({ relations: ['customer', 'items', 'status_history'] });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id }, relations: ['customer', 'items', 'status_history'] });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(data: CreateOrderDto): Promise<Order> {
    let customer = await this.customersService.findByPhone(data.customer_phone);
    if (!customer) {
      customer = await this.customersService.create({
        name: data.customer_name,
        phone_whatsapp: data.customer_phone,
        address: data.pickup_address,
      });
    }

  const pickupScheduled = data.pickup_date
    ? new Date(`${data.pickup_date}T10:00`)
    : undefined;

    const order = this.orderRepo.create({
      customer: { id: customer.id } as any,
      service_type: data.service_type,
      quantity_kg: data.quantity_kg,
      notes: data.notes,
      pickup_address: data.pickup_address,
      pickup_scheduled_at: pickupScheduled,
      pickup_lat: data.pickup_lat,
      pickup_lng: data.pickup_lng,
      total_price: data.total_price,
      status: OrderStatus.PENDIENTE,
    });
    const saved = await this.orderRepo.save(order);
    await this.logStatusChange(saved.id, null, OrderStatus.PENDIENTE, 'system');
    return saved;
  }

  async update(id: string, data: UpdateOrderDto): Promise<Order> {
    await this.orderRepo.update(id, data);
    return this.findOne(id);
  }

  async changeStatus(id: string, newStatus: OrderStatus, changedBy: string): Promise<Order> {
    const order = await this.findOne(id);
    const oldStatus = order.status;
    order.status = newStatus;
    await this.orderRepo.save(order);
    await this.logStatusChange(id, oldStatus, newStatus, changedBy);
    return order;
  }

  private async logStatusChange(
    orderId: string,
    from: OrderStatus | null,
    to: OrderStatus,
    changedBy: string,
  ) {
    const entry = this.statusHistoryRepo.create({
      order: { id: orderId } as any,
      from_status: from ?? null,
      to_status: to,
      changed_by: changedBy,
    });
    await this.statusHistoryRepo.save(entry);
  }
}
