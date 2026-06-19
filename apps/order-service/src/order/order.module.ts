import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrdersController } from './order.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ClientsModule.register([
    {
      name: 'CART_SERVICE',
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'cart_queue',
        queueOptions: { durable: true },
      },
    },
    {
      name: 'PRODUCT_SERVICE',
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'product_queue',
        queueOptions: { durable: true },
      },
    },
    {
      name: 'USER_SERVICE',
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'user_queue',
        queueOptions: { durable: true }
      }
    },
    {
      name: 'NOTIFICATION_SERVICE',
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'notification_queue',
        queueOptions: { durable: true }
      }
    }
  ])],
  controllers: [OrdersController],
  providers: [OrderService],
})
export class OrdersModule { }
