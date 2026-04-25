import { plainToInstance, Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, validateSync } from 'class-validator';

enum NodeEnv {
    Development = 'development',
    Production = 'production',
    Test = 'test',
}

class EnvironmentVariables {
    @IsEnum(NodeEnv)
    NODE_ENV!: NodeEnv;

    @IsString()
    @IsNotEmpty()
    SERVICE_NAME!: string;

    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(1)
    @Max(65535)
    PORT!: number;

    @IsString()
    @IsNotEmpty()
    DB_HOST!: string;

    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(1)
    @Max(65535)
    DB_PORT!: number;

    @IsString()
    @IsNotEmpty()
    DB_USERNAME!: string;

    @IsString()
    @IsNotEmpty()
    DB_PASSWORD!: string;

    @IsString()
    @IsNotEmpty()
    DB_DATABASE!: string;

    @IsString()
    @IsOptional()
    DB_SCHEMA?: string;

    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    DB_SSL!: boolean;

    @IsString()
    @IsNotEmpty()
    REDIS_HOST!: string;

    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(1)
    @Max(65535)
    REDIS_PORT!: number;

    @IsString()
    @IsOptional()
    REDIS_PASSWORD?: string;

    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(0)
    REDIS_DB!: number;

    @IsString()
    @IsNotEmpty()
    ADMIN_USERNAME!: string;

    @IsString()
    @IsNotEmpty()
    ADMIN_PASSWORD_HASH!: string;

    @IsString()
    @IsNotEmpty()
    SESSION_SECRET!: string;

    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(1)
    SESSION_IDLE_TIMEOUT!: number;

    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(1)
    SESSION_MAX_LIFETIME!: number;

    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(1)
    LOGIN_MAX_ATTEMPTS!: number;

    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(1)
    LOGIN_LOCKOUT_DURATION!: number;

    @IsString()
    @IsNotEmpty()
    MINIO_INTERNAL_ENDPOINT!: string;

    @IsString()
    @IsNotEmpty()
    MINIO_PUBLIC_ENDPOINT!: string;

    @IsString()
    @IsNotEmpty()
    MINIO_ACCESS_KEY!: string;

    @IsString()
    @IsNotEmpty()
    MINIO_SECRET_KEY!: string;

    @IsString()
    @IsNotEmpty()
    MINIO_BUCKET!: string;
}

export function validateEnvironment(config: Record<string, unknown>): EnvironmentVariables {
    const validatedConfig = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: false,
    });

    const errors = validateSync(validatedConfig, {
        skipMissingProperties: false,
        whitelist: true,
    });

    if (errors.length > 0) {
        const messages = errors
            .flatMap((error) => Object.values(error.constraints ?? {}))
            .join('; ');

        throw new Error(`Environment validation failed: ${messages}`);
    }

    return validatedConfig;
}
