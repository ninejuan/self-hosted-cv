import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { getRedisConnectionToken } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { SequelizeModule } from '@nestjs/sequelize';
import type Redis from 'ioredis';

import { AuditModule } from '@/modules/audit/audit.module';
import { AppSetting } from '@/modules/settings/entities/app-setting.entity';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminBootstrapService } from './admin-bootstrap.service';
import { AuthSessionService } from './auth-session.service';
import { LoginAttemptService } from './login-attempt.service';
import { TwoFactorService } from './two-factor.service';

@Module({
  imports: [
    ConfigModule,
    AuditModule,
    SequelizeModule.forFeature([AppSetting]),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService, getRedisConnectionToken()],
      useFactory: (configService: ConfigService, redis: Redis) => ({
        throttlers: [
          {
            ttl:
              configService.get<number>('LOGIN_LOCKOUT_DURATION', 900) * 1000,
            limit: configService.get<number>('LOGIN_MAX_ATTEMPTS', 5),
          },
        ],
        storage: new ThrottlerStorageRedisService(redis),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AdminBootstrapService,
    AuthSessionService,
    LoginAttemptService,
    TwoFactorService,
  ],
})
export class AuthModule {}
