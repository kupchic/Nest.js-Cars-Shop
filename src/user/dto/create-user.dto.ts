import { RegisterDto } from '../../auth/dto/register.dto';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { UserRoles } from '../model/enum/user-roles.enum';
import { ArrayUnique, IsEnum, IsIn, IsOptional } from 'class-validator';

export class CreateUserDto extends RegisterDto {
  @ApiProperty({
    isArray: true,
    enum: UserRoles,
    required: false,
  })
  @IsEnum(UserRoles, { each: true })
  @ArrayUnique()
  @IsOptional()
  roles?: [UserRoles];

  @IsOptional()
  @IsIn([undefined], { message: 'property confirmPassword should not exist' })
  confirmPassword: undefined;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
