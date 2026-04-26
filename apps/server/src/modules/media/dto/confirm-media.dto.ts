import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ConfirmMediaDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsOptional()
  @MaxLength(512)
  altText?: string;
}
