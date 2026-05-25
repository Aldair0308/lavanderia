import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Customer } from './Customer';
import { OrderItem } from './OrderItem';
import { OrderStatusHistory } from './OrderStatusHistory';
import { OrderStatus } from './OrderStatus';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Customer, (customer) => customer.orders, { eager: true })
  customer!: Customer;

  @Column({ type: 'enum', enum: Object.values(OrderStatus) })
  status!: OrderStatus;

  @Column({ type: 'varchar', length: 255 })
  service_type!: string;

  @Column({ type: 'decimal', nullable: true })
  quantity_kg?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'text' })
  pickup_address!: string;

  @Column({ type: 'timestamp', nullable: true })
  pickup_scheduled_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  delivered_at?: Date;

  @Column({ type: 'decimal', nullable: true })
  total_price?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  pickup_lat?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  pickup_lng?: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items!: OrderItem[];

  @OneToMany(() => OrderStatusHistory, (history) => history.order, { cascade: true })
  status_history!: OrderStatusHistory[];
}
