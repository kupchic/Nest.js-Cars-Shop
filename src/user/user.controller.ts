import {
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Res,
} from '@nestjs/common';
import { User } from './user.schema';
import { UserService } from './user.service';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users Module')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  getAll(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User> {
    const user: User = await this.userService.findById(id);
    if (!user) {
      throw new ConflictException('User not found');
    }
    return user;
  }

  @Delete(':id')
  async deleteById(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<Response> {
    const user: User = await this.userService.deleteById(id);
    if (!user) {
      throw new ConflictException('User not found');
    }
    return res.status(HttpStatus.OK).send();
  }
}
