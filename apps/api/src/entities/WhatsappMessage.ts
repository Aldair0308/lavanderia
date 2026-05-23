import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { WhatsappConversation } from './WhatsappConversation';

export enum MessageDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

@Entity({ name: 'whatsapp_messages' })
export class WhatsappMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => WhatsappConversation, (conv) => conv.id, { onDelete: 'CASCADE' })
  conversation!: WhatsappConversation;

  @Column({ type: 'enum', enum: MessageDirection })
  direction!: MessageDirection;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'boolean', default: false })
  is_automated!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  timestamp!: Date;
}
