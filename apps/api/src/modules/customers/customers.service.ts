import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../entities/Customer';

@Injectable()
export class CustomersService {
  constructor(@InjectRepository(Customer) private readonly repo: Repository<Customer>) {}

  async findAll(): Promise<Customer[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.repo.findOne({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async findByPhone(phone: string): Promise<Customer | null> {
    return this.repo.findOne({ where: { phone_whatsapp: phone } });
  }

  async create(data: Partial<Customer>): Promise<Customer> {
    const cust = this.repo.create(data);
    return this.repo.save(cust);
  }

  // Additional methods like update, delete can be added as needed
}
