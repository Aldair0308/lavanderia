import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from '../../entities/Settings';

@Injectable()
export class SettingsService {
  constructor(@InjectRepository(Settings) private readonly repo: Repository<Settings>) {}

  async findAll(): Promise<Settings[]> {
    return this.repo.find();
  }

  async findOne(key: string): Promise<Settings> {
    const setting = await this.repo.findOne({ where: { key } });
    if (!setting) throw new NotFoundException('Setting not found');
    return setting;
  }

  async createOrUpdate(key: string, value: string): Promise<Settings> {
    let setting = await this.repo.findOne({ where: { key } });
    if (!setting) {
      setting = this.repo.create({ key, value });
    } else {
      setting.value = value;
    }
    return this.repo.save(setting);
  }
}
