import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoles } from '../../user/entities/user-roles.enum';
import { ROLES_KEY } from '../decorators';
import { User } from '../../user/schemas';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles: UserRoles[] = this.reflector.getAllAndOverride<
      UserRoles[]
    >(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!requiredRoles) {
      return true;
    }
    const { user }: { user: User } = context.switchToHttp().getRequest();
    return (
      user.roles.includes(UserRoles.ADMIN) ||
      requiredRoles.some((role: UserRoles) => user.roles.includes(role))
    );
  }
}
