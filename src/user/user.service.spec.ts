import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import mongoose, { FilterQuery, Model } from 'mongoose';
import { User, UserDocument } from './schemas';
import { getModelToken } from '@nestjs/mongoose';
import { UserRoles } from './model/enum/user-roles.enum';
import { RegisterDto } from '../auth/dto/register.dto';
import * as bcrypt from 'bcrypt';
import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  IPaginatedResponse,
  KeyValuePairs,
  ModelName,
  SearchQueryDto,
} from '../common/model';
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
    cart: 's',
    orders: [],
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(ModelName.USER),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            create: jest.fn(),
            aggregate: jest.fn(),
            deleteMany: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    mockUserModel = await module.get<Model<UserDocument>>(
      getModelToken(ModelName.USER),
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
        .mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce(null),
        } as never);
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
      mockUserModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUser) as never,
      });
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
  describe('getUsers', () => {
    it('should call aggregate with default aggregate setup if called without args and return first item after exec()', async () => {
      // given
      const expectedMatches: any[] = [
        {},
        {
          pageSize: 20,
          page: 1,
          skip: 0,
        },
      ];
      const expectedItem: string = 'firstItem';
      const spy: SpyInstance = jest
        .spyOn(mockUserModel, 'aggregate')
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce([expectedItem] as never),
        } as any);
      // when
      const result: IPaginatedResponse<User> = await service.getUsers();
      //then
      expect(result).toEqual(expectedItem);
      expect(spy).nthCalledWith(
        1,
        createSearchAggregateQuery.call(null, ...expectedMatches),
      );
    });

    it('should call aggregate with prefilled aggregate setup if called with args and return first item after exec()', async () => {
      // given
      const query: SearchQueryDto = {
        page: '2',
        pageSize: '40a',
        search: 'search word',
      };
      const reg: RegExp = new RegExp('search|word', 'i');
      const expectedMatches: any[] = [
        {
          $or: [
            {
              firstName: reg,
            },
            {
              lastName: reg,
            },
            {
              email: reg,
            },
          ],
        },
        {
          pageSize: 40,
          page: 2,
          skip: 40,
        },
      ];
      const expectedItem: string = 'firstItem';
      const spy: SpyInstance = jest
        .spyOn(mockUserModel, 'aggregate')
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce([expectedItem] as never),
        } as any);
      // when
      const result: IPaginatedResponse<User> = await service.getUsers(query);
      //then
      expect(result).toEqual(expectedItem);
      expect(spy).nthCalledWith(
        1,
        createSearchAggregateQuery.call(null, ...expectedMatches),
      );
    });

    it('should catch error', async () => {
      const error: ConflictException = new ConflictException();
      jest.spyOn(mockUserModel, 'aggregate').mockImplementation(() => {
        throw error;
      });
      // when
      //then
      await expect(service.getUsers()).rejects.toEqual(error);
    });
  });

  describe('findById', () => {
    it('should call findById model method', async () => {
      // given
      jest.spyOn(mockUserModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      } as never);
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
      jest.spyOn(mockUserModel, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      } as never);
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
      jest.spyOn(mockUserModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      } as never);
      // when
      await service.partialUserUpdate(mockUser.id, {
        isBlocked: true,
      });
      // then
      expect(mockUserModel.findByIdAndUpdate).nthCalledWith(
        1,
        mockUser.id,
        {
          isBlocked: true,
        },
        { new: true },
      );
    });
    it('should throw error if user to update was not found', async () => {
      // given
      const e: NotFoundException = new NotFoundException('User Not Found');
      jest.spyOn(mockUserModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as never);
      // when
      // then
      await expect(
        service.partialUserUpdate(mockUser.id, { lastName: '2' }),
      ).rejects.toEqual(e);
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
  describe('deleteMany', () => {
    it('should call model deleteMany method is $in operator by _id and return deletedCount', async () => {
      // given
      const expectedIdArr: string[] = ['id'];
      const expectedQuery: FilterQuery<UserDocument> = {
        _id: {
          $in: expectedIdArr,
        },
      };
      const expectedDeletedCount: number = 2;
      const spy: SpyInstance = jest
        .spyOn(mockUserModel, 'deleteMany')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce({
            deletedCount: expectedDeletedCount,
          }),
        } as never);
      // when
      const result: number = await service.deleteMany(expectedIdArr);
      // then
      expect(result).toEqual(expectedDeletedCount);
      expect(spy).nthCalledWith(1, expectedQuery);
    });
    it('should catch error', async () => {
      // given
      const e: ConflictException = new ConflictException();
      jest.spyOn(mockUserModel, 'deleteMany').mockImplementation(() => {
        throw e;
      });
      // when
      // then
      await expect(service.deleteMany([mockUser.id])).rejects.toEqual(e);
    });
  });
  describe('blockUser', () => {
    it('should throw error if user to block is not found', async () => {
      // given
      const e: NotFoundException = new NotFoundException('User not found');
      jest.spyOn(mockUserModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as never);
      // when
      // then
      await expect(service.blockUser(mockUser.id)).rejects.toEqual(e);
    });
    it('should throw error if user try to block not customer', async () => {
      // given
      const e: ConflictException = new ConflictException(
        'You can block the user only with the role Customer. This user is ADMIN, CUSTOMER',
      );
      jest.spyOn(mockUserModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce({
          ...mockUser,
          roles: [UserRoles.ADMIN, UserRoles.CUSTOMER],
        }),
      } as never);
      // when
      // then
      await expect(service.blockUser(mockUser.id)).rejects.toEqual(e);
    });

    it('should partial update user isBlocked and refresh_token fields', async () => {
      // given
      jest.spyOn(mockUserModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce({
          ...mockUser,
          roles: [UserRoles.CUSTOMER],
        }),
      } as never);
      const expectedFields: Partial<User> = {
        isBlocked: true,
        refresh_token: null,
      };
      const spy: SpyInstance = jest
        .spyOn(service, 'partialUserUpdate')
        .mockResolvedValueOnce(mockUser);
      // when
      const result: User = await service.blockUser(mockUser.id);
      // then
      expect(result).toEqual(mockUser);
      expect(spy).nthCalledWith(1, mockUser.id, expectedFields);
    });
  });

  describe('assignToManager', () => {
    it('should throw error if user to assign is not found', async () => {
      // given
      const e: NotFoundException = new NotFoundException('User not found');
      jest.spyOn(mockUserModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as never);
      // when
      // then
      await expect(service.assignToManager(mockUser.id)).rejects.toEqual(e);
    });
    it('should throw error if user to assign is blocked', async () => {
      // given
      const e: ConflictException = new ConflictException('User is blocked');
      jest.spyOn(mockUserModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce({ ...mockUser, isBlocked: true }),
      } as never);
      // when
      // then
      await expect(service.assignToManager(mockUser.id)).rejects.toEqual(e);
    });
    it('should throw error if user to assign already is MANAGER', async () => {
      // given
      const user: User = {
        ...mockUser,
        roles: [UserRoles.CUSTOMER, UserRoles.MANAGER],
      };
      const e: ConflictException = new ConflictException(
        'The user already is CUSTOMER, MANAGER',
      );
      jest.spyOn(mockUserModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(user),
      } as never);
      // when
      // then
      await expect(service.assignToManager(mockUser.id)).rejects.toEqual(e);
    });
    it('should partial update user to assign with Manager,Customer roles', async () => {
      // given
      const user: User = {
        ...mockUser,
        roles: [UserRoles.CUSTOMER],
      };
      jest.spyOn(mockUserModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(user),
      } as never);
      const spy: SpyInstance = jest
        .spyOn(service, 'partialUserUpdate')
        .mockResolvedValueOnce(mockUser);
      // when
      const result: User = await service.assignToManager(mockUser.id);
      // then
      expect(result).toEqual(mockUser);
      expect(spy).nthCalledWith(1, mockUser.id, {
        roles: [UserRoles.MANAGER, UserRoles.CUSTOMER],
      });
    });
  });
});

function createSearchAggregateQuery(
  filterMatch: FilterQuery<User>,
  pagination: KeyValuePairs<any>,
): mongoose.PipelineStage[] {
  return [
    { $match: filterMatch },
    {
      $facet: {
        data: [
          { $skip: pagination.skip },
          { $limit: pagination.pageSize },
          {
            $addFields: {
              id: {
                $toString: '$_id',
              },
            },
          },
          {
            $unset: '_id',
          },
        ],
        pagination: [{ $count: 'totalRecords' }],
      },
    },
    {
      $set: {
        pagination: { $first: '$pagination' },
      },
    },
    {
      $addFields: {
        'pagination.page': pagination.page,
        'pagination.pageSize': pagination.pageSize,
        'pagination.pagesCount': {
          $ceil: {
            $divide: ['$pagination.totalRecords', pagination.pageSize],
          },
        },
      },
    },
  ];
}
