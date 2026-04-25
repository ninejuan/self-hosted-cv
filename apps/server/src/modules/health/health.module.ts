import { Module } from '@nestjs/common';
import { RedisHealthModule } from '@nestjs-modules/ioredis';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './health.controller';

@Module({
    imports: [TerminusModule, RedisHealthModule],
    controllers: [HealthController],
})
export class HealthModule {}
