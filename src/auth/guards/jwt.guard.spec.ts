import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt.guard';
import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import SpyInstance = jest.SpyInstance;

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;
  const context: ExecutionContext = {
    getHandler(): any {
      return;
    },
    getClass(): any {
      return;
    },
  } as ExecutionContext;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [JwtAuthGuard],
    }).compile();
    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true when IS_PUBLIC_KEY is true', () => {
    // given
    reflector.getAllAndOverride = jest.fn().mockReturnValue(true);
    // when
    const canActivate: boolean = guard.canActivate(context) as boolean;
    // then
    expect(canActivate).toBe(true);
  });
  it('should call canActivate of super()', () => {
    // given
    reflector.getAllAndOverride = jest.fn().mockReturnValue(false);
    const mockedSuperCanActivate: SpyInstance = jest
      .spyOn(AuthGuard('jwt').prototype, 'canActivate')
      .mockReturnValue(true);
    // when
    const canActivate: boolean = guard.canActivate(context) as boolean;
    // then
    expect(mockedSuperCanActivate).nthCalledWith(1, context);
    expect(canActivate).toBe(true);
    mockedSuperCanActivate.mockRestore();
  });
});
