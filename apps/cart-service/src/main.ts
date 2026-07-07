import { NestFactory } from '@nestjs/core';
import { CartServiceModule } from './cart-service.module';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(CartServiceModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe())
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL')!],
      queue: 'cart_queue',
      queueOptions: { durable: true },
    },
  })
  await app.startAllMicroservices()
  await app.listen(process.env.port ?? 3002);
}
bootstrap();
