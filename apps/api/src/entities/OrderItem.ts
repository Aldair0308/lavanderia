import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './Order';

@Entity({ name: 'order_items' })
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order!: Order;

  @Column({ type: 'varchar', length: 255 })
  item_type!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'decimal' })
  price_per_unit!: number;
}
