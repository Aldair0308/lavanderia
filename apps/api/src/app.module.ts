import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dns from 'dns';
import { HealthController } from './health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { CustomersModule } from './modules/customers/customers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { AgentModule } from './modules/agent/agent.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { SettingsModule } from './modules/settings/settings.module';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Node < 17 fallback
}

function forceIpv4(url: string | undefined): string | undefined {
  if (url && url.includes('supabase.co')) {
    return url.replace(
      /@([^:]+)\.supabase\.co/,
      '@104.18.38.10'
    );
  }
  return url;
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: forceIpv4(process.env.DATABASE_URL) || 'postgresql://postgres:postgres@localhost:5432/lavanderia',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    }),
    AuthModule,
    CustomersModule,
    OrdersModule,
    WhatsappModule,
    AgentModule,
    CampaignsModule,
    SettingsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
