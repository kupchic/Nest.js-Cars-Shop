import { UserRoles } from './enum/user-roles.enum';

export interface UserJwtPayload {
  roles: UserRoles[];
  id: string;
  email: string;
}
