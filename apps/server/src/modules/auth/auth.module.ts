import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuditModule } from '@/modules/audit/audit.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
    imports: [
        ConfigModule,
        AuditModule,
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => [{
                ttl: configService.get<number>('LOGIN_LOCKOUT_DURATION', 900) * 1000,
                limit: configService.get<number>('LOGIN_MAX_ATTEMPTS', 5),
            }],
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
