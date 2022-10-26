import {
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { User } from './user.schema';
import { UserService } from './user.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators';
import { UserRoles } from './entities/user-roles.enum';
import { UserDto } from './entities/user-response.dto';

@ApiTags('Users Module')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiResponse({
    type: [UserDto],
    status: HttpStatus.OK,
  })
  @Roles(UserRoles.ADMIN)
  @Get()
  getAll(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @ApiResponse({
    type: UserDto,
    status: HttpStatus.OK,
  })
  @Roles(UserRoles.ADMIN)
  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User> {
    const user: User = await this.userService.findById(id);
    if (!user) {
      throw new ConflictException('User not found');
    }
    return user;
  }

  @Roles(UserRoles.ADMIN)
  @Delete(':id')
  async deleteById(@Param('id') id: string): Promise<void> {
    const user: User = await this.userService.deleteById(id);
    if (!user) {
      throw new ConflictException('User not found');
    }
  }
}
