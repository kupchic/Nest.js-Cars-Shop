import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
} from '@nestjs/common';
import { User } from './schemas';
import { UserService } from './user.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRoles } from './model/enum/user-roles.enum';
import { UserDto } from './dto/user-response.dto';
import { Roles } from '../common/decorators';
import { MongoIdStringPipe } from '../common/pipes';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { SearchQueryDto } from '../common/model';
import { IPaginatedUsersResponse } from './model/users-paginated-respose';

@ApiTags('Users Module')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiResponse({
    type: IPaginatedUsersResponse,
  })
  @Roles(UserRoles.ADMIN)
  @Get()
  getUsers(@Query() query?: SearchQueryDto | undefined): Promise<User[]> {
    return this.userService.getUsers(query);
  }

  @ApiResponse({
    type: UserDto,
  })
  @Roles(UserRoles.ADMIN)
  @Get(':id')
  async getUserById(@Param('id', MongoIdStringPipe) id: string): Promise<User> {
    try {
      const user: User = await this.userService.findById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (e) {
      throw e;
    }
  }

  @ApiResponse({
    type: String,
    description: 'status od deleting',
  })
  @Roles(UserRoles.ADMIN)
  @UsePipes(new MongoIdStringPipe(true))
  @Delete('delete-many')
  async deleteMany(@Body() arr: string[]): Promise<string> {
    try {
      const deletedCount: number = await this.userService.deleteMany(arr);
      if (deletedCount === 0) {
        return 'No Users have been deleted';
      }
      return deletedCount === arr.length
        ? `All ${deletedCount} users have been successfully deleted`
        : `${deletedCount} users have been deleted. ${
            arr.length - deletedCount
          } users was not found`;
    } catch (e) {
      throw e;
    }
  }

  @Roles(UserRoles.ADMIN)
  @Delete(':id')
  async deleteUserById(
    @Param('id', MongoIdStringPipe) id: string,
  ): Promise<void> {
    try {
      const user: User = await this.userService.deleteById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
    } catch (e) {
      throw e;
    }
  }

  @ApiResponse({
    type: UserDto,
  })
  @Roles(UserRoles.ADMIN)
  @Post()
  async create(@Body() createDto: CreateUserDto): Promise<User> {
    return this.userService.registerUser(createDto);
  }

  @ApiResponse({
    type: UserDto,
  })
  @Roles(UserRoles.ADMIN)
  @Put(':id')
  async update(
    @Param('id', MongoIdStringPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.partialUserUpdate(id, updateUserDto);
  }

  @ApiResponse({
    type: UserDto,
  })
  @Roles(UserRoles.ADMIN)
  @Put('block/:id')
  async blockUser(@Param('id', MongoIdStringPipe) id: string): Promise<User> {
    return this.userService.blockUser(id);
  }

  @ApiResponse({
    type: UserDto,
  })
  @Roles(UserRoles.MANAGER)
  @Put('assign-to-manager/:id')
  async assignToManager(
    @Param('id', MongoIdStringPipe) id: string,
  ): Promise<User> {
    return this.userService.assignToManager(id);
  }
}
