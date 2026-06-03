import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(configService: ConfigService) {
    const connectionString = configService.get<string>('DATABASE_URL');

    const pool = new PrismaPg({ connectionString });
    super({ adapter: pool });
  }

  async onModuleInit() {
    await this.$connect();
  }
}