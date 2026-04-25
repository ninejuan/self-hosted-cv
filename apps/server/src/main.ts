import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';
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

    await app.listen(configService.getOrThrow<number>('PORT'));
}
bootstrap();
