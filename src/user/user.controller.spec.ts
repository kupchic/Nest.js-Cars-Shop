import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { User } from './schemas';
import { UserRoles } from './model/enum/user-roles.enum';
import { UserService } from './user.service';
import { NotFoundException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { IPaginatedResponse } from '../common/model';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
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
    cart: 's',
    orders: [],
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

  describe('getUsers', () => {
    it('should do getAll request', async () => {
      // given
      const spy: SpyInstance = jest
        .spyOn(userService, 'getUsers')
        .mockResolvedValueOnce(null);
      //when
      const result: IPaginatedResponse<User> = await controller.getUsers();
      // then
      expect(result).toEqual(null);
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
  describe('deleteMany', () => {
    it('should call deleteMany method and return string message how many items have been deleted if all', async () => {
      // given
      const expectedResult: string =
        'All 1 users have been successfully deleted';
      jest.spyOn(userService, 'deleteMany').mockResolvedValueOnce(1);
      // when
      const result: string = await controller.deleteMany(['id']);
      // then
      expect(result).toEqual(expectedResult);
    });
    it('should call deleteMany method and return string message how many items have been deleted if not all', async () => {
      // given
      const ids: string[] = ['id', 'id'];
      const expectedResult: string =
        '1 users have been deleted. 1 users was not found';
      const spy: SpyInstance = jest
        .spyOn(userService, 'deleteMany')
        .mockResolvedValueOnce(1);
      // when
      const result: string = await controller.deleteMany(ids);
      // then
      expect(result).toEqual(expectedResult);
      expect(spy).nthCalledWith(1, ids);
    });
    it('should throw error if deleteMany method return zero deleted items', async () => {
      // given
      const expectedError: NotFoundException = new NotFoundException(
        'No Users have been deleted',
      );
      jest.spyOn(userService, 'deleteMany').mockResolvedValueOnce(0);
      //when
      // then
      await expect(controller.deleteMany([mockUser.id])).rejects.toEqual(
        expectedError,
      );
    });
  });
  describe('create', () => {
    it('should  call service register method', async () => {
      // given
      const dto: CreateUserDto = {
        roles: [UserRoles.MANAGER],
      } as CreateUserDto;
      const spy: SpyInstance = jest
        .spyOn(userService, 'registerUser')
        .mockResolvedValueOnce(mockUser);
      // when
      const result: User = await controller.create(dto);
      // then
      expect(result).toEqual(mockUser);
      expect(spy).nthCalledWith(1, dto);
    });
  });
  describe('update', () => {
    it('should  call service partialUserUpdate method', async () => {
      // given
      const dto: UpdateUserDto = {
        roles: [UserRoles.MANAGER],
      };
      const spy: SpyInstance = jest
        .spyOn(userService, 'partialUserUpdate')
        .mockResolvedValueOnce(mockUser);
      // when
      const result: User = await controller.update(mockUser.id, dto);
      // then
      expect(result).toEqual(mockUser);
      expect(spy).nthCalledWith(1, mockUser.id, dto);
    });
  });
  describe('blockUser', () => {
    it('should  call service blockUser method', async () => {
      // given
      const spy: SpyInstance = jest
        .spyOn(userService, 'blockUser')
        .mockResolvedValueOnce(mockUser);
      // when
      const result: User = await controller.blockUser(mockUser.id);
      // then
      expect(result).toEqual(mockUser);
      expect(spy).nthCalledWith(1, mockUser.id);
    });
  });
  describe('assignToManager', () => {
    it('should  call service assignToManager method', async () => {
      // given
      const spy: SpyInstance = jest
        .spyOn(userService, 'assignToManager')
        .mockResolvedValueOnce(mockUser);
      // when
      const result: User = await controller.assignToManager(mockUser.id);
      // then
      expect(result).toEqual(mockUser);
      expect(spy).nthCalledWith(1, mockUser.id);
    });
  });
});
