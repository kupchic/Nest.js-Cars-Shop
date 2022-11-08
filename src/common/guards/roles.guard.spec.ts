import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { User } from '../../schemas';
import { UserRoles } from '../../user/entities/user-roles.enum';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;
  let user: User;
  const context: ExecutionContext = {
    getHandler(): void {},
    getClass(): void {},
    switchToHttp(): any {
      return {
        getRequest(): any {
          return {
            user: user,
          };
        },
      };
    },
  } as ExecutionContext;
  beforeEach(async () => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
    user = { roles: [UserRoles.MANAGER] } as User;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if no required roles', () => {
      // given
      reflector.getAllAndOverride = jest.fn().mockReturnValue(null);
      // when
      const canActivate: boolean = guard.canActivate(context) as boolean;
      // then
      expect(canActivate).toBe(true);
    });
    it('should return true if user roles includes Admin', () => {
      // given
      user.roles.push(UserRoles.ADMIN);
      reflector.getAllAndOverride = jest
        .fn()
        .mockReturnValue([UserRoles.MANAGER]);
      // when
      const canActivate: boolean = guard.canActivate(context) as boolean;
      // then
      expect(canActivate).toBe(true);
    });
    it('should return true if user roles includes required role', () => {
      // given
      reflector.getAllAndOverride = jest.fn().mockReturnValue(user.roles);
      // when
      const canActivate: boolean = guard.canActivate(context) as boolean;
      // then
      expect(canActivate).toBe(true);
    });
    it('should return false if user roles not includes required role', () => {
      // given
      reflector.getAllAndOverride = jest
        .fn()
        .mockReturnValue([UserRoles.ADMIN]);
      // when
      const canActivate: boolean = guard.canActivate(context) as boolean;
      // then
      expect(canActivate).toBe(false);
    });
  });
});
