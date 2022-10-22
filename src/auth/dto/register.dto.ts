import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { LoginDto } from './login.dto';
import { IsSameAs } from '../../common/validators/is-same-as.validator';

export class RegisterDto extends LoginDto {
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

  @ApiProperty({ pattern: '80(17|29|33|44)[0-9]{7}' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^80(17|29|33|44)[0-9]{7}$/, {
    message:
      'Wrong phone number. Phone number should fit the pattern well: 80 17|29|33|44 1234567',
  })
  readonly phone: string;

  @ApiProperty({ description: 'The same as password field' })
  @IsSameAs('password', {
    message: 'password and confirmPassword fields are not same',
  })
  readonly confirmPassword: string;
}
