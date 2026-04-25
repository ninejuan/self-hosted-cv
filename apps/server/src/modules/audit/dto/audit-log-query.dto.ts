import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

import { AuditAction } from '@/database/enums';

export class AuditLogQueryDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    page = 1;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    @IsOptional()
    limit = 20;

    @IsEnum(AuditAction)
    @IsOptional()
    action?: AuditAction;

    @IsString()
    @IsOptional()
    entityType?: string;

    @IsDateString()
    @IsOptional()
    from?: string;

    @IsDateString()
    @IsOptional()
    to?: string;
}
