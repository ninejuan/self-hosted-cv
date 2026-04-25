import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, IsUrl, IsUUID, MaxLength, Min } from 'class-validator';

export class UpdateExperienceDto {
    @IsUUID()
    @IsOptional()
    sectionId?: string;

    @IsUUID()
    @IsOptional()
    profileId?: string;

    @IsString()
    @MaxLength(255)
    @IsOptional()
    company?: string;

    @IsString()
    @MaxLength(255)
    @IsOptional()
    role?: string;

    @IsDateString()
    @IsOptional()
    startDate?: string;

    @IsDateString()
    @IsOptional()
    endDate?: string | null;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    location?: string | null;

    @IsString()
    @IsOptional()
    description?: string | null;

    @IsUrl({ require_protocol: true })
    @IsOptional()
    @MaxLength(2048)
    url?: string | null;

    @IsInt()
    @Min(0)
    @IsOptional()
    sortOrder?: number;

    @IsBoolean()
    @IsOptional()
    visible?: boolean;
}
