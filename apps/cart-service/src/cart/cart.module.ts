import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule,
    ClientsModule.registerAsync([{
      name: 'PRODUCT_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: Transport.RMQ,
        options: {
          urls: [configService.get<string>('RABBITMQ_URL')!],
          queue: 'product_queue',
          queueOptions: { durable: true },
        },
      })
    }]),],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule { }
