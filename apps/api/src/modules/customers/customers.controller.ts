import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Customer } from '../../entities/Customer';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @Get()
  async findAll(): Promise<Customer[]> {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Customer> {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateCustomerDto): Promise<Customer> {
    return this.service.create(dto);
  }
}
