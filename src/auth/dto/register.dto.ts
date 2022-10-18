import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { LoginDto } from './login.dto';

export class RegisterDto extends LoginDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly lastName: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^80(17|29|33|44)[0-9]{7}$/, {
    message:
      'Wrong phone number. Phone number fit the pattern well: 80 17|29|33|44 1234567',
  })
  readonly phone: string;
}
