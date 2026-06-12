import { Module } from '@nestjs/common';
import { CartServiceController } from './cart-service.controller';
import { CartServiceService } from './cart-service.service';
import { CartModule } from './cart/cart.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from '@app/auth';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true, envFilePath: ['.env', 'apps/cart-service/.env']
  }),
    AuthModule,
    CartModule,
    PrismaModule],
  controllers: [CartServiceController],
  providers: [CartServiceService],
})
export class CartServiceModule { }
