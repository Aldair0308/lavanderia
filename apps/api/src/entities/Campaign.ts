import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { CampaignRecipient } from './CampaignRecipient';

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  SENDING = 'sending',
  SENT = 'sent',
}

@Entity({ name: 'campaigns' })
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text' })
  message_template!: string;

  @Column({ type: 'varchar', length: 255 })
  target_segment!: string;

  @Column({ type: 'enum', enum: CampaignStatus })
  status!: CampaignStatus;

  @Column({ type: 'timestamp', nullable: true })
  scheduled_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  sent_at?: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @OneToMany(() => CampaignRecipient, (rec) => rec.campaign, { cascade: true })
  recipients!: CampaignRecipient[];
}
