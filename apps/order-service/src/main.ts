import { NestFactory } from '@nestjs/core';
import { OrderServiceModule } from './order-service.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(OrderServiceModule);
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(process.env.port ?? 3003);
}
bootstrap();
