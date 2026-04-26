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

export class CreateEducationDto {
  @IsUUID()
  sectionId!: string;

  @IsUUID()
  profileId!: string;

  @IsString()
  @MaxLength(255)
  degree!: string;

  @IsString()
  @MaxLength(255)
  institution!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  @IsOptional()
  endDate?: string | null;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string | null;

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
