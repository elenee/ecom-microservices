import { NestFactory } from '@nestjs/core';
import { CartServiceModule } from './cart-service.module';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(CartServiceModule);
  app.useGlobalPipes(new ValidationPipe())
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'cart_queue',
      queueOptions: { durable: true },
    },
  })
  await app.startAllMicroservices()
  await app.listen(process.env.port ?? 3002);
}
bootstrap();
