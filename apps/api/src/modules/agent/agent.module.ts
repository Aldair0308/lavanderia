import { Module, forwardRef } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappConversation } from '../../entities/WhatsappConversation';
import { Settings } from '../../entities/Settings';
import { OrdersModule } from '../orders/orders.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([WhatsappConversation, Settings]),
    OrdersModule,
    forwardRef(() => WhatsappModule),
  ],
  providers: [AgentService],
  controllers: [AgentController],
  exports: [AgentService],
})
export class AgentModule {}
