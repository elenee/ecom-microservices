import { NestFactory } from '@nestjs/core';
import { CartServiceModule } from './cart-service.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(CartServiceModule);
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(process.env.port ?? 3002);
}
bootstrap();
