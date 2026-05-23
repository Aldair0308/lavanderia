import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Order } from './Order';
import { OrderStatus } from './OrderStatus';

@Entity({ name: 'order_status_history' })
export class OrderStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Order, (order) => order.status_history, { onDelete: 'CASCADE' })
  order!: Order;

	@Column({ type: 'enum', enum: Object.values(OrderStatus), nullable: true })
	from_status!: OrderStatus | null;

	@Column({ type: 'enum', enum: Object.values(OrderStatus) })
	to_status!: OrderStatus;

  @Column({ type: 'varchar', length: 255 })
  changed_by!: string;

  @CreateDateColumn({ type: 'timestamp' })
  changed_at!: Date;
}
