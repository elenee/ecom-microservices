import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrdersController } from './order.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'CART_SERVICE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')!],
            queue: 'cart_queue',
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'PRODUCT_SERVICE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')!],
            queue: 'product_queue',
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'USER_SERVICE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')!],
            queue: 'user_queue',
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'NOTIFICATION_SERVICE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')!],
            queue: 'notification_queue',
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrderService],
})
export class OrdersModule {}
