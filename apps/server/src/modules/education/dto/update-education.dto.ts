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
import { Transform } from 'class-transformer';

export class UpdateEducationDto {
  @IsUUID()
  @IsOptional()
  sectionId?: string;

  @IsUUID()
  @IsOptional()
  profileId?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  degree?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  institution?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @Transform(({ value }) => (value === "" ? null : value))
  @IsOptional()
  @IsDateString({}, { message: "endDate must be a valid date or empty" })
  endDate?: string | null;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string | null;

  @Transform(({ value }) => (value === "" ? null : value))
  @IsUrl({ require_protocol: true, require_tld: false })
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
