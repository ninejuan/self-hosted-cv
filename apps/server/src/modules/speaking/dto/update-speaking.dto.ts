import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, IsUrl, IsUUID, MaxLength, Min } from 'class-validator';

export class UpdateSpeakingDto {
    @IsUUID()
    @IsOptional()
    sectionId?: string;

    @IsUUID()
    @IsOptional()
    profileId?: string;

    @IsString()
    @MaxLength(255)
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    location?: string | null;

    @IsDateString()
    @IsOptional()
    date?: string;

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
