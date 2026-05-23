import { Controller, Post, Body, Param } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly service: CampaignsService) {}

  @Post()
  async create(@Body() dto: CreateCampaignDto) {
    return this.service.createCampaign(dto);
  }

  @Post(':id/send')
  async send(@Param('id') id: string) {
    await this.service.scheduleAndSend(id);
    return { status: 'sent' };
  }
}
