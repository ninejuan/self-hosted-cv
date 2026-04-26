import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateProjectDto {
  @IsUUID()
  @IsOptional()
  sectionId?: string;

  @IsUUID()
  @IsOptional()
  profileId?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @IsUrl({ require_protocol: true })
  @IsOptional()
  @MaxLength(2048)
  url?: string | null;

  @IsDateString()
  @IsOptional()
  date?: string | null;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  visible?: boolean;
}
