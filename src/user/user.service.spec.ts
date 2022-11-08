import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas';
import { getModelToken } from '@nestjs/mongoose';
import { UserRoles } from './entities/user-roles.enum';
import { RegisterDto } from '../auth/dto/register.dto';
import * as bcrypt from 'bcrypt';
import { ConflictException } from '@nestjs/common';
import SpyInstance = jest.SpyInstance;

describe('UserService', () => {
  let service: UserService;
  let mockUserModel: Model<UserDocument>;
  const userPass: string = '123456';
  const mockUser: User = {
    id: '63569752ea779b68568822ba',
    password: userPass,
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
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    mockUserModel = await module.get<Model<UserDocument>>(
      getModelToken(User.name),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('registerUser', () => {
    const registerDto: RegisterDto = {
      ...mockUser,
      password: '111',
      confirmPassword: '111',
    };
    it('should create new user with hashed pass if no user with this email', async () => {
      // given
      const findOneSpy: SpyInstance = jest
        .spyOn(mockUserModel, 'findOne')
        .mockResolvedValueOnce(null);
      const bcryptSpy: SpyInstance = jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValueOnce('hashed' as never);
      const createSpy: SpyInstance = jest
        .spyOn(mockUserModel, 'create')
        .mockResolvedValueOnce(mockUser as never);
      const expectedCreatedUser: User = {
        ...mockUser,
      };
      // when
      const result: User = await service.registerUser(registerDto);
      //then
      expect(result).toEqual(expectedCreatedUser);
      expect(findOneSpy).nthCalledWith(1, { email: registerDto.email });
      expect(bcryptSpy).nthCalledWith(1, registerDto.password, 10);
      expect(createSpy).nthCalledWith(1, {
        ...registerDto,
        password: 'hashed',
      });
    });
    it('should throw ConflictException if user with email already exist', async () => {
      // given
      mockUserModel.findOne = jest.fn().mockResolvedValueOnce(mockUser);
      // jest.spyOn(mockUserModel, 'findOne').mockResolvedValueOnce(mockUser);
      const expectedError: ConflictException = new ConflictException(
        'The actor with the following email address is already registered.',
      );
      // when
      //then
      await expect(service.registerUser(registerDto)).rejects.toEqual(
        expectedError,
      );
    });
  });
  describe('getAllUsers', () => {
    it('should call find method with empty filter', async () => {
      const findSpy: SpyInstance = jest
        .spyOn(mockUserModel, 'find')
        .mockResolvedValueOnce([mockUser]);
      // when
      const result: User[] = await service.getAllUsers();
      //then
      expect(result).toEqual([mockUser]);
      expect(findSpy).nthCalledWith(1, {});
    });

    it('should catch error', async () => {
      const error: ConflictException = new ConflictException();
      jest.spyOn(mockUserModel, 'find').mockImplementation(() => {
        throw error;
      });
      // when
      //then
      await expect(service.getAllUsers()).rejects.toEqual(error);
    });
  });

  describe('findById', () => {
    it('should call findById model method', async () => {
      // given
      jest.spyOn(mockUserModel, 'findById').mockResolvedValueOnce(mockUser);
      // when
      const result: User = await service.findById(mockUser.id);
      // then
      expect(mockUserModel.findById).nthCalledWith(1, mockUser.id);
      expect(result).toEqual(mockUser);
    });
    it('should catch error', async () => {
      // given
      const e: ConflictException = new ConflictException();
      jest.spyOn(mockUserModel, 'findById').mockImplementation(() => {
        throw e;
      });
      // when
      // then
      await expect(service.findById(mockUser.id)).rejects.toEqual(e);
    });
  });

  describe('deleteById', () => {
    it('should call findByIdAndDelete model method', async () => {
      // given
      jest.spyOn(mockUserModel, 'findByIdAndDelete');
      // when
      await service.deleteById(mockUser.id);
      // then
      expect(mockUserModel.findByIdAndDelete).nthCalledWith(1, mockUser.id);
    });
    it('should catch error', async () => {
      // given
      const e: ConflictException = new ConflictException();
      jest.spyOn(mockUserModel, 'findByIdAndDelete').mockImplementation(() => {
        throw e;
      });
      // when
      // then
      await expect(service.deleteById(mockUser.id)).rejects.toEqual(e);
    });
  });
  describe('partialUserUpdate', () => {
    it('should call findByIdAndUpdate model method', async () => {
      // given
      jest.spyOn(mockUserModel, 'findByIdAndUpdate');
      // when
      await service.partialUserUpdate(mockUser.id, {
        isBlocked: true,
      });
      // then
      expect(mockUserModel.findByIdAndUpdate).nthCalledWith(1, mockUser.id, {
        isBlocked: true,
      });
    });
    it('should catch error if try to update without new state', async () => {
      // given
      const e: ConflictException = new ConflictException(
        'Provide data to update',
      );
      // when
      // then
      await expect(
        service.partialUserUpdate(mockUser.id, null),
      ).rejects.toEqual(e);
    });
  });
});
