import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';
import { MigrationRunner } from '@/database/migration-runner';
import { LoggerService } from '@/logger/logger.service';

import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        bufferLogs: true,
    });
    const configService = app.get(ConfigService);
    const logger = app.get(LoggerService);

    app.useLogger(logger);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );
    app.useGlobalFilters(new HttpExceptionFilter(logger));
    app.useGlobalInterceptors(new LoggingInterceptor(logger));

    try {
        await app.get(MigrationRunner).runPendingMigrations();
    } catch (error) {
        const stack = error instanceof Error ? error.stack : undefined;
        const message = error instanceof Error ? error.message : 'Unknown migration error';

        logger.error(`Database migration failed: ${message}`, stack, 'Bootstrap');
        await app.close();
        process.exit(1);
    }

    await app.listen(configService.getOrThrow<number>('PORT'));
}
bootstrap();
