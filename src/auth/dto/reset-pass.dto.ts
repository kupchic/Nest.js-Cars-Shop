import { ApiProperty } from '@nestjs/swagger';
import { IsSameAs } from '../../common/validators';
import { Matches } from 'class-validator';

export class ResetPassDto {
  @ApiProperty({
    maxLength: 20,
    minLength: 8,
    description: 'Password must be 8-20 characters long, contain A-z, 0-9',
  })
  @Matches(/^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{8,20}$/, {
    message: 'Password must be 8-20 characters long, contain A-z, 0-9',
  })
  readonly password: string;
  @ApiProperty({ description: 'The same as password field' })
  @IsSameAs('password', {
    message: 'password and confirmPassword fields are not same',
  })
  readonly confirmPassword: string;
}
