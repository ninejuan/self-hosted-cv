import { registerAs } from '@nestjs/config';
import { RedisModuleOptions } from '@nestjs-modules/ioredis';

export const redisConfig = registerAs('redis', (): RedisModuleOptions => ({
    type: 'single',
    options: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD || undefined,
        db: Number(process.env.REDIS_DB),
        lazyConnect: false,
    },
}));
