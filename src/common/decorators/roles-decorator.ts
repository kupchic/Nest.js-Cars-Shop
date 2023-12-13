import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { UserRoles } from '../../user/model/enum/user-roles.enum';

export const ROLES_KEY: string = 'roles';
export const Roles: (...roles: UserRoles[]) => CustomDecorator = (
  ...roles: UserRoles[]
): CustomDecorator => SetMetadata(ROLES_KEY, roles);
