import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ResetPassDto } from './reset-pass.dto';

export class RegisterDto extends ResetPassDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ minLength: 3, maxLength: 25 })
  @IsString()
  @IsNotEmpty()
  @Length(3, 25, {
    message: 'The length of password should be between 8-25 characters',
  })
  readonly firstName: string;

  @ApiProperty({ minLength: 3, maxLength: 25 })
  @IsString()
  @IsNotEmpty()
  @Length(3, 25)
  readonly lastName: string;

  @ApiProperty({ pattern: '80(17|25|29|33|44)[0-9]{7}' })
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('BY')
  @Matches(/^80(17|25|29|33|44)[0-9]{7}$/, {
    message:
      'Wrong phone number. Phone number should fit the pattern well: 80 17|29|33|44 1234567',
  })
  readonly phone: string;
}
