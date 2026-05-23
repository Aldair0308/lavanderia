import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  service_type?: string;

  @IsOptional()
  @IsNumber()
  quantity_kg?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  pickup_address?: string;

  @IsOptional()
  @IsNumber()
  total_price?: number;
}
