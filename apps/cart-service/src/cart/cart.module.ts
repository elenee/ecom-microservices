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
          urls: ['amqp://localhost:5672'],
          queue: 'product_queue',
          queueOptions: { durable: true },
        },
      })
    }]),],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule { }
