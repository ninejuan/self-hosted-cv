import { IsNotEmpty, IsString, Length } from 'class-validator';

export class TotpCodeDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code!: string;
}
