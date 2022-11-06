import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { User } from './user.schema';
import { UserService } from './user.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRoles } from './entities/user-roles.enum';
import { UserDto } from './entities/user-response.dto';
import { Roles } from '../common/decorators';

@ApiTags('Users Module')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiResponse({
    type: [UserDto],
  })
  @Roles(UserRoles.ADMIN)
  @Get()
  getAll(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @ApiResponse({
    type: UserDto,
  })
  @Roles(UserRoles.ADMIN)
  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User> {
    try {
      const user: User = await this.userService.findById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (e) {
      return e;
    }
  }

  @Roles(UserRoles.ADMIN)
  @Delete(':id')
  async deleteUserById(@Param('id') id: string): Promise<void> {
    try {
      const user: User = await this.userService.deleteById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
    } catch (e) {
      return e;
    }
  }
}
