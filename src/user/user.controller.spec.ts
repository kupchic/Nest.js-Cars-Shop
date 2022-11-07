import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { User } from './user.schema';
import { UserRoles } from './entities/user-roles.enum';
import { UserService } from './user.service';
import { NotFoundException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import SpyInstance = jest.SpyInstance;

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  const mockUser: User = {
    id: 'mock',
    password: '1234',
    email: 'mock@gmail.com',
    roles: [UserRoles.CUSTOMER],
    refresh_token: 'some',
    firstName: 'Alex',
    lastName: 'Tester',
    phone: '8029',
    isBlocked: false,
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: createMock<UserService>(),
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should do getAll request', async () => {
      // given
      const spy: SpyInstance = jest
        .spyOn(userService, 'getAllUsers')
        .mockResolvedValueOnce([mockUser]);
      //when
      const result: User[] = await controller.getAll();
      // then
      expect(result).toEqual([mockUser]);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
  describe('getUserById', () => {
    it('should do findById request', async () => {
      // given
      const spy: SpyInstance = jest
        .spyOn(userService, 'findById')
        .mockResolvedValueOnce(mockUser);
      //when
      const result: User = await controller.getUserById(mockUser.id);
      // then
      expect(result).toEqual(mockUser);
      expect(spy).nthCalledWith(1, mockUser.id);
    });
    it('should throw NotFoundException if user was not found', async () => {
      // given
      const expectedError: NotFoundException = new NotFoundException(
        'User not found',
      );
      const spy: SpyInstance = jest
        .spyOn(userService, 'findById')
        .mockResolvedValueOnce(null);
      //when
      // then
      await expect(controller.getUserById(mockUser.id)).rejects.toEqual(
        expectedError,
      );
      expect(spy).nthCalledWith(1, mockUser.id);
    });
  });
  describe('deleteUserById', () => {
    it('should do deleteById request', async () => {
      // given
      const spy: SpyInstance = jest
        .spyOn(userService, 'deleteById')
        .mockResolvedValueOnce(mockUser);
      //when
      const result: void = await controller.deleteUserById(mockUser.id);
      // then
      expect(result).toBeUndefined();
      expect(spy).nthCalledWith(1, mockUser.id);
    });
    it('should throw NotFoundException if user was not found', async () => {
      // given
      const expectedError: NotFoundException = new NotFoundException(
        'User not found',
      );
      const spy: SpyInstance = jest
        .spyOn(userService, 'deleteById')
        .mockResolvedValueOnce(null);
      //when
      // then
      await expect(controller.deleteUserById(mockUser.id)).rejects.toEqual(
        expectedError,
      );
      expect(spy).nthCalledWith(1, mockUser.id);
    });
  });
});
