import { IsEmail, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    maxLength: 20,
    minLength: 8,
    description: 'Password must be 8-20 characters long, contain A-z, 0-9',
  })
  @Matches(/^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{8,20}$/, {
    message: 'Password must be 8-20 characters long, contain A-z, 0-9',
  })
  readonly password: string;
}
