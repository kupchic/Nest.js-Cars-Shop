import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User, UserDocument, USERS_COLLECTION_NAME } from './schemas';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../auth/dto/register.dto';
import { UserRoles } from './model/enum/user-roles.enum';
import { IPaginatedResponse, SearchQueryDto } from '../common/model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(USERS_COLLECTION_NAME) private userModel: Model<UserDocument>,
  ) {}

  async registerUser(registerDto: RegisterDto): Promise<User> {
    try {
      const user: User = await this.findByEmail(registerDto.email);
      if (!!user) {
        throw new ConflictException(
          `The actor with the following email address is already registered.`,
        );
      }
      return this.userModel.create({
        ...registerDto,
        password: await this._hash(registerDto.password),
      });
    } catch (e) {
      throw e;
    }
  }

  async getUsers(query?: SearchQueryDto | undefined): Promise<any> {
    try {
      const pageSize: number = parseInt(query?.pageSize || '20');
      const page: number = parseInt(query?.page || '1') - 1;
      const skip: number = page * pageSize;
      const match: FilterQuery<User> = {};
      if (query.search) {
        const reg: RegExp = new RegExp(query.search.split(' ').join('|'), 'i');
        match.$or = [
          {
            firstName: reg,
          },
          {
            lastName: reg,
          },
          {
            email: reg,
          },
        ];
      }
      return await this.userModel
        .aggregate([
          { $match: match },
          {
            $facet: {
              data: [{ $skip: skip }, { $limit: pageSize }],
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
              'pagination.page': page + 1,
              'pagination.pageSize': pageSize,
              'pagination.pagesCount': {
                $ceil: {
                  $divide: ['$pagination.totalRecords', pageSize],
                },
              },
            },
          },
        ])
        .exec()
        .then((res: IPaginatedResponse<User>[]) => res[0]);
    } catch (e) {
      throw e;
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      return this.userModel.findOne({ email }).exec();
    } catch (e) {
      throw e;
    }
  }

  async findById(id: string): Promise<User> {
    try {
      return this.userModel.findById(id).exec();
    } catch (e) {
      throw e;
    }
  }

  async deleteById(id: string): Promise<User> {
    try {
      return this.userModel.findByIdAndDelete(id).exec();
    } catch (e) {
      throw e;
    }
  }

  async deleteMany(idArray: string[]): Promise<number> {
    try {
      return await this.userModel
        .deleteMany({ _id: { $in: idArray } })
        .exec()
        .then((v: any) => v.deletedCount);
    } catch (e) {
      throw e;
    }
  }

  async blockUser(id: string): Promise<User> {
    try {
      const user: User = await this.findById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (
        user.roles.some(
          (role: UserRoles) =>
            role === UserRoles.ADMIN || role === UserRoles.MANAGER,
        )
      ) {
        throw new ConflictException(
          `You can block the user only with the role Customer. This user is ${user.roles.join(
            ', ',
          )}`,
        );
      }

      return await this.partialUserUpdate(id, {
        isBlocked: true,
        refresh_token: null,
      });
    } catch (e) {
      throw e;
    }
  }

  async assignToManager(id: string): Promise<User> {
    try {
      const user: User = await this.findById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (user.isBlocked) {
        throw new ConflictException('User is blocked');
      }
      if (
        user.roles.some(
          (role: UserRoles) =>
            role === UserRoles.ADMIN || role === UserRoles.MANAGER,
        )
      ) {
        throw new ConflictException(
          `The user already is ${user.roles.join(', ')}`,
        );
      }

      return await this.partialUserUpdate(id, {
        roles: [UserRoles.MANAGER, UserRoles.CUSTOMER],
      });
    } catch (e) {
      throw e;
    }
  }

  async partialUserUpdate(
    userId: string,
    state: Partial<Omit<User, 'id'>>,
    returnNew: boolean = true,
  ): Promise<User> {
    try {
      if (Object.keys(state || {}).length) {
        return this.userModel
          .findByIdAndUpdate(userId, state, { new: returnNew })
          .exec()
          .then((user: User) => {
            if (!user) {
              throw new NotFoundException('User Not Found');
            }
            return user;
          });
      } else throw new ConflictException('Provide data to update');
    } catch (e) {
      throw e;
    }
  }

  async comparePasswords(pass: string, user: User): Promise<boolean> {
    return bcrypt.compare(pass, user.password);
  }

  private _hash(str: string): Promise<string> {
    return str ? bcrypt.hash(str, 10) : null;
  }
}
