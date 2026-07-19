import { Module } from '@nestjs/common';
import { UserServiceController } from './user-service.controller';
import { UserServiceService } from './user-service.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@app/auth';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { LocalStrategy } from './auth/strategy/local.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/user-service/.env',
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [UserServiceController, AuthController],
  providers: [UserServiceService, AuthService, LocalStrategy],
})
export class UserServiceModule {}
