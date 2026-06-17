import { Module } from '@nestjs/common';
import { PaymentServiceController } from './payment-service.controller';
import { PaymentServiceService } from './payment-service.service';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@app/auth';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', 'apps/payment-service/.env'] }),
    AuthModule,
    PaymentsModule, PrismaModule],
  controllers: [PaymentServiceController],
  providers: [PaymentServiceService],
})
export class PaymentServiceModule { }
