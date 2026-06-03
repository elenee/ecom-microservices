import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { S3Module } from '@app/s3';

@Module({
  imports: [S3Module],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
