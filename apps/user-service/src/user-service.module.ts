import { Module } from '@nestjs/common';
import { UserServiceController } from './user-service.controller';
import { UserServiceService } from './user-service.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@app/auth';

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true, envFilePath: 'apps/user-service/.env',},),
    PrismaModule, UsersModule, AuthModule],
  controllers: [UserServiceController],
  providers: [UserServiceService],
})
export class UserServiceModule {}
