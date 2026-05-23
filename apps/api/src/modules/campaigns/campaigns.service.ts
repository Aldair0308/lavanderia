import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign, CampaignStatus } from '../../entities/Campaign';
import { CampaignRecipient } from '../../entities/CampaignRecipient';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    @InjectRepository(Campaign) private readonly campaignRepo: Repository<Campaign>,
    @InjectRepository(CampaignRecipient) private readonly recipientRepo: Repository<CampaignRecipient>,
    @Inject(forwardRef(() => WhatsappService))
    private readonly whatsappService: WhatsappService,
  ) {}

  async createCampaign(data: any): Promise<Campaign> {
    if (data.scheduled_at && typeof data.scheduled_at === 'string') {
      (data as any).scheduled_at = new Date(data.scheduled_at);
    }
    const campaign = this.campaignRepo.create(data as Partial<Campaign>);
    return this.campaignRepo.save(campaign);
  }

  async scheduleAndSend(id: string): Promise<void> {
    this.logger.debug('Fetching campaign for sending', { id });
    const campaign = (await this.campaignRepo.findOne({
      where: { id },
      relations: ['recipients', 'recipients.customer'],
    })) as any;
    if (!campaign) throw new Error('Campaign not found');
    for (const recipient of campaign.recipients) {
      const text = this.interpolateTemplate(campaign.message_template, recipient.customer);
      await this.whatsappService.sendMessage(recipient.customer.phone_whatsapp, text, false);
      // random delay 3‑8 s
      const delay = 3000 + Math.random() * 5000;
      await new Promise((res) => setTimeout(res, delay));
      recipient.sent_at = new Date();
      await this.recipientRepo.save(recipient);
    }
    campaign.status = CampaignStatus.SENT;
    campaign.sent_at = new Date();
    await this.campaignRepo.save(campaign);
  }

  private interpolateTemplate(template: string, customer: any): string {
    return template.replace(/{nombre}/g, customer.name || '')
                   .replace(/{ultimo_servicio}/g, '') // placeholder
                   .replace(/{dias_inactivo}/g, '');
  }
}
