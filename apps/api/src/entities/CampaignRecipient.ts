import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Campaign } from './Campaign';
import { Customer } from './Customer';

@Entity({ name: 'campaign_recipients' })
export class CampaignRecipient {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Campaign, (campaign) => campaign.recipients, { onDelete: 'CASCADE' })
  campaign!: Campaign;

  @ManyToOne(() => Customer, { eager: true })
  customer!: Customer;

  @Column({ type: 'timestamp', nullable: true })
  sent_at?: Date;

  @Column({ type: 'boolean', default: false })
  response_received!: boolean;
}
