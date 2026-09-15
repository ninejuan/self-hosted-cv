import { Controller, Get } from '@nestjs/common';
import { RedisHealthIndicator } from '@nestjs-modules/ioredis';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  SequelizeHealthIndicator,
} from '@nestjs/terminus';

import { Public } from '@/common/decorators/public.decorator';

@Public()
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly database: SequelizeHealthIndicator,
    private readonly redis: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.database.pingCheck('database'),
      () => this.redis.isHealthy('redis'),
    ]);
  }

  @Get('live')
  @HealthCheck()
  live(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }

  @Get('ready')
  @HealthCheck()
  ready(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.database.pingCheck('database'),
      () => this.redis.isHealthy('redis'),
    ]);
  }
}
