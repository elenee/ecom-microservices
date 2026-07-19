import { Module } from '@nestjs/common';
import { ProductServiceController } from './product-service.controller';
import { ProductServiceService } from './product-service.service';
import { CategoriesModule } from './categories/categories.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { S3Module } from '@app/s3';
import { ProductsModule } from './products/products.module';
import { AuthModule } from '@app/auth';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'apps/product-service/.env'],
    }),
    PrismaModule,
    CategoriesModule,
    ProductsModule,
    S3Module,
    AuthModule,
  ],
  controllers: [ProductServiceController],
  providers: [ProductServiceService],
})
export class ProductServiceModule {}
