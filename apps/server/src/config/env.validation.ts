import { plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateIf,
  validateSync,
} from 'class-validator';

enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(NodeEnv)
  @IsOptional()
  NODE_ENV?: NodeEnv;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(65535)
  @IsOptional()
  APP_PORT?: number;

  @IsString()
  @IsOptional()
  APP_URL?: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  EXPORT_LOCK_TTL_MS?: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  EXPORT_MAX_EXEC_MS?: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  EXPORT_MAX_OBJECTS?: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  EXPORT_MAX_OBJECT_BYTES?: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  EXPORT_MAX_TOTAL_BYTES?: number;

  @IsString()
  @IsNotEmpty()
  POSTGRES_HOST!: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(65535)
  POSTGRES_PORT!: number;

  @IsString()
  @IsNotEmpty()
  POSTGRES_USER!: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_PASSWORD!: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_DB!: string;

  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  @IsOptional()
  POSTGRES_SSL?: boolean;

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

  @IsString()
  @IsNotEmpty()
  ADMIN_USERNAME!: string;

  @IsString()
  @IsNotEmpty()
  ADMIN_PASSWORD!: string;

  @IsString()
  @IsNotEmpty()
  SESSION_SECRET!: string;

  @ValidateIf(
    (environment: EnvironmentVariables) =>
      environment.NODE_ENV === NodeEnv.Production,
  )
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9+/]{43}=$/, {
    message: 'TOTP_ENCRYPTION_KEY must be a base64-encoded 32-byte key',
  })
  TOTP_ENCRYPTION_KEY?: string;

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

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  AUDIT_MAX_FIELD_LEN = 1024;

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

  @IsString()
  @IsOptional()
  CORS_ORIGIN?: string;

  @IsString()
  @IsOptional()
  GITHUB_REPO?: string;

  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  @IsOptional()
  DISABLE_UPDATE_CHECK?: boolean;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsOptional()
  UPDATE_CHECK_INTERVAL?: number;
}

export function validateEnvironment(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: false,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
    whitelist: false,
  });

  if (errors.length > 0) {
    const messages = errors
      .flatMap((error) => Object.values(error.constraints ?? {}))
      .join('; ');

    throw new Error(`Environment validation failed: ${messages}`);
  }

  return validatedConfig;
}
