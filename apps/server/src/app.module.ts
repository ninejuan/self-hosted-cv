import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthGuard } from '@/common/guards/auth.guard';
import { RequestIdMiddleware } from '@/common/middleware/request-id.middleware';
import { databaseConfig } from '@/config/database.config';
import { validateEnvironment } from '@/config/env.validation';
import { redisConfig } from '@/config/redis.config';
import { MigrationRunner } from '@/database/migration-runner';
import { LoggerService } from '@/logger/logger.service';
import { AuditInterceptor } from '@/modules/audit/audit.interceptor';
import { AuditModule } from '@/modules/audit/audit.module';
import { AuditLog } from '@/modules/audit/entities/audit-log.entity';
import { AuthModule } from '@/modules/auth/auth.module';
import { ContactModule } from '@/modules/contact/contact.module';
import { SocialLink } from '@/modules/contact/entities/social-link.entity';
import { CvModule } from '@/modules/cv/cv.module';
import { EducationModule } from '@/modules/education/education.module';
import { Education } from '@/modules/education/entities/education.entity';
import { ExperienceModule } from '@/modules/experience/experience.module';
import { WorkExperience } from '@/modules/experience/entities/work-experience.entity';
import { HealthModule } from '@/modules/health/health.module';
import { LinkedinModule } from '@/modules/linkedin/linkedin.module';
import { Media } from '@/modules/media/entities/media.entity';
import { MediaModule } from '@/modules/media/media.module';
import { MinioModule } from '@/modules/minio/minio.module';
import { SideProject } from '@/modules/project/entities/side-project.entity';
import { ProjectModule } from '@/modules/project/project.module';
import { Profile } from '@/modules/profile/entities/profile.entity';
import { ProfileModule } from '@/modules/profile/profile.module';
import { Section } from '@/modules/section/entities/section.entity';
import { SectionModule } from '@/modules/section/section.module';
import { AppSetting } from '@/modules/settings/entities/app-setting.entity';
import { SettingsModule } from '@/modules/settings/settings.module';
import { Speaking } from '@/modules/speaking/entities/speaking.entity';
import { SpeakingModule } from '@/modules/speaking/speaking.module';
import { UpdateCheckerModule } from '@/modules/update-checker/update-checker.module';
import { Writing } from '@/modules/writing/entities/writing.entity';
import { WritingModule } from '@/modules/writing/writing.module';

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
        AuditModule,
        AuthModule,
        MinioModule,
        MediaModule,
        HealthModule,
        ProfileModule,
        SectionModule,
        ExperienceModule,
        WritingModule,
        SpeakingModule,
        ProjectModule,
        EducationModule,
        ContactModule,
        CvModule,
        UpdateCheckerModule,
        SettingsModule,
        LinkedinModule,
    ],
    providers: [
        LoggerService,
        MigrationRunner,
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: AuditInterceptor,
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(RequestIdMiddleware).forRoutes('*');
    }
}
