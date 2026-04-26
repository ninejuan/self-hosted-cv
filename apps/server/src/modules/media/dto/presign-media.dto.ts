import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PresignMediaDto {
  @IsString()
  @IsNotEmpty()
  filename!: string;

  @IsString()
  @IsNotEmpty()
  content_type!: string;

  @IsString()
  @IsOptional()
  purpose?: string;
}
