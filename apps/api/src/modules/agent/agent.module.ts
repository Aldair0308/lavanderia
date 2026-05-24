import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappConversation } from '../../entities/WhatsappConversation';
import { WhatsappMessage } from '../../entities/WhatsappMessage';
import { Settings } from '../../entities/Settings';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([WhatsappConversation, WhatsappMessage, Settings]),
    OrdersModule,
  ],
  providers: [AgentService],
  controllers: [AgentController],
  exports: [AgentService],
})
export class AgentModule {}
