import { ApiProperty } from '@nestjs/swagger';
import { UserRoles } from '../model/enum/user-roles.enum';

export class UserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  phone: string;

  @ApiProperty({
    isArray: true,
    enum: UserRoles,
    enumName: 'UserRoles',
  })
  roles: [UserRoles];
}
