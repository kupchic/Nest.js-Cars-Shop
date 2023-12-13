import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';
import { IsSameAs } from '../../common/validators';

export class ChangePassDto {
  @ApiProperty({
    maxLength: 20,
    minLength: 8,
    description: 'Password must be 8-20 characters long, contain A-z, 0-9',
  })
  @Matches(/^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{8,20}$/, {
    message: 'oldPassword must be 8-20 characters long, contain A-z, 0-9',
  })
  readonly oldPassword: string;

  @ApiProperty({
    maxLength: 20,
    minLength: 8,
    description: 'Password must be 8-20 characters long, contain A-z, 0-9',
  })
  @Matches(/^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{8,20}$/, {
    message: 'newPassword must be 8-20 characters long, contain A-z, 0-9',
  })
  readonly newPassword: string;

  @ApiProperty({
    maxLength: 20,
    minLength: 8,
    description: 'Password must be 8-20 characters long, contain A-z, 0-9',
  })
  @IsNotEmpty()
  @IsSameAs('newPassword', {
    message: 'repeatNewPassword field should compare to new password',
  })
  readonly repeatNewPassword: string;
}
