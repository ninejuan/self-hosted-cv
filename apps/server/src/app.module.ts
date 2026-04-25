import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { SequelizeModule } from '@nestjs/sequelize';

import { RequestIdMiddleware } from '@/common/middleware/request-id.middleware';
import { databaseConfig } from '@/config/database.config';
import { validateEnvironment } from '@/config/env.validation';
import { redisConfig } from '@/config/redis.config';
import { LoggerService } from '@/logger/logger.service';
import { HealthModule } from '@/modules/health/health.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [databaseConfig, redisConfig],
            validate: validateEnvironment,
        }),
        SequelizeModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => configService.getOrThrow('database'),
        }),
        RedisModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => configService.getOrThrow('redis'),
        }),
        HealthModule,
    ],
    providers: [LoggerService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(RequestIdMiddleware).forRoutes('*');
    }
}
