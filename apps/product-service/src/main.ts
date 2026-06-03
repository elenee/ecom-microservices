import { NestFactory } from '@nestjs/core';
import { ProductServiceModule } from './product-service.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ProductServiceModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  await app.listen(process.env.port ?? 3001);
}
bootstrap();
