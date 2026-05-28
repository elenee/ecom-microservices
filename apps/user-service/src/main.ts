import { NestFactory } from '@nestjs/core';
import { UserServiceModule } from './user-service.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(UserServiceModule);
  app.useGlobalPipes(new ValidationPipe({whitelist: true, forbidNonWhitelisted: true, transform: true}))
  app.use(cookieParser())
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
