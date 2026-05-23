import { Controller, Get, Param, Post, Body, Patch } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Settings } from '../../entities/Settings';

@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get()
  async findAll(): Promise<Settings[]> {
    return this.service.findAll();
  }

  @Get(':key')
  async findOne(@Param('key') key: string): Promise<Settings> {
    return this.service.findOne(key);
  }

  @Post()
  async upsert(@Body() body: { key: string; value: string }): Promise<Settings> {
    return this.service.createOrUpdate(body.key, body.value);
  }

  @Patch(':key')
  async update(@Param('key') key: string, @Body('value') value: string): Promise<Settings> {
    return this.service.createOrUpdate(key, value);
  }
}
