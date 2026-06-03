import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true, envFilePath: "libs/s3/.env"})],
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}
