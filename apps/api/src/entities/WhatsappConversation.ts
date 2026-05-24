import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Customer } from './Customer';

@Entity({ name: 'whatsapp_conversations' })
export class WhatsappConversation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Customer, { eager: true })
  customer!: Customer;

  @Column({ type: 'text', nullable: true })
  remote_jid!: string | null;

  @Column({ type: 'boolean', default: true })
  is_agent_active!: boolean;

  @Column({ type: 'boolean', default: false })
  needs_human!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  last_message_at!: Date;
}
