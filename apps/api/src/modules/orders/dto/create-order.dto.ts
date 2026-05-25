import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  customer_name!: string;

  @IsString()
  customer_phone!: string;

  @IsString()
  service_type!: string;

  @IsNumber()
  quantity_kg!: number;

  @IsString()
  pickup_address!: string;

  @IsOptional()
  @IsDateString()
  pickup_date?: string;

  @IsOptional()
  @IsString()
  pickup_time?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  total_price?: number;

  @IsOptional()
  @IsNumber()
  pickup_lat?: number;

  @IsOptional()
  @IsNumber()
  pickup_lng?: number;
}
