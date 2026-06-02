import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategy/jwt.strategy';
import { LocalStrategy } from './strategy/local.strategy';
import { UsersModule } from 'apps/user-service/src/users/users.module';
import { AuthController } from 'apps/user-service/src/auth/auth.controller';
import { AuthService } from 'apps/user-service/src/auth/auth.service';

@Module({
  imports: [JwtModule.registerAsync({
    useFactory: (configService: ConfigService) => ({
      global: true,
      secret: configService.get<string>('JWT_SECRET')
    }),
    inject: [ConfigService]
  }),
    UsersModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
})
export class AuthModule { }
