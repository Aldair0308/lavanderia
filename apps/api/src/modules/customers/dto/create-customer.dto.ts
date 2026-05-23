import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  name!: string;

  @IsString()
  phone_whatsapp!: string; // Expected format 52XXXXXXXXXX

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];
}
