import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { SequelizeModule } from '@nestjs/sequelize';

import { RequestIdMiddleware } from '@/common/middleware/request-id.middleware';
import { databaseConfig } from '@/config/database.config';
import { validateEnvironment } from '@/config/env.validation';
import { redisConfig } from '@/config/redis.config';
import { MigrationRunner } from '@/database/migration-runner';
import { LoggerService } from '@/logger/logger.service';
import { AuditLog } from '@/modules/audit/entities/audit-log.entity';
import { SocialLink } from '@/modules/contact/entities/social-link.entity';
import { Education } from '@/modules/education/entities/education.entity';
import { WorkExperience } from '@/modules/experience/entities/work-experience.entity';
import { HealthModule } from '@/modules/health/health.module';
import { Media } from '@/modules/media/entities/media.entity';
import { SideProject } from '@/modules/project/entities/side-project.entity';
import { Profile } from '@/modules/profile/entities/profile.entity';
import { Section } from '@/modules/section/entities/section.entity';
import { AppSetting } from '@/modules/settings/entities/app-setting.entity';
import { Speaking } from '@/modules/speaking/entities/speaking.entity';
import { Writing } from '@/modules/writing/entities/writing.entity';

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
            useFactory: (configService: ConfigService) => ({
                ...configService.getOrThrow('database'),
                models: [Profile, Section, WorkExperience, Writing, Speaking, SideProject, Education, SocialLink, Media, AuditLog, AppSetting],
            }),
        }),
        RedisModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => configService.getOrThrow('redis'),
        }),
        HealthModule,
    ],
    providers: [LoggerService, MigrationRunner],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(RequestIdMiddleware).forRoutes('*');
    }
}
