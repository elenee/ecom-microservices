import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor(configService: ConfigService) {
        const connectionString = configService.get<string>('DATABASE_URL');

        const pool = new PrismaPg({ connectionString });
        super({ adapter: pool });
    }

    async onModuleInit() {
        await this.$connect()
    }
}
