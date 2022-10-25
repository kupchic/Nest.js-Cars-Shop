import { LoginDto } from './login.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsSameAs } from '../../common/validators';

export class ResetPassDto extends LoginDto {
  @ApiProperty({ description: 'The same as password field' })
  @IsSameAs('password', {
    message: 'password and confirmPassword fields are not same',
  })
  readonly confirmPassword: string;
}
