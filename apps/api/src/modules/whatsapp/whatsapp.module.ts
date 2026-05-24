import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { WhatsappConversation } from '../../entities/WhatsappConversation';
import { WhatsappMessage } from '../../entities/WhatsappMessage';
import { AgentModule } from '../agent/agent.module';
import { CustomersModule } from '../customers/customers.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WhatsappConversation, WhatsappMessage]),
    forwardRef(() => AgentModule),
    CustomersModule,
    AuthModule,
  ],
  providers: [WhatsappService],
  controllers: [WhatsappController],
  exports: [WhatsappService],
})
export class WhatsappModule {}
