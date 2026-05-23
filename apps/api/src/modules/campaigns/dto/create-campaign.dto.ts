import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { CampaignStatus } from '../../../entities/Campaign';

export class CreateCampaignDto {
  @IsString()
  name!: string;

  @IsString()
  message_template!: string;

  @IsString()
  target_segment!: string;

  @IsEnum(CampaignStatus)
  status!: CampaignStatus;

  @IsOptional()
  @IsDateString()
  scheduled_at?: string;
}
