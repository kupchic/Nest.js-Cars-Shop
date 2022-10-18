import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { Response } from 'express';
import { from, map } from 'rxjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('/register')
  @UsePipes(ValidationPipe)
  register(@Body() registerDTO: RegisterDto, @Res() res: Response): any {
    return from(this.userService.registerUser(registerDTO)).pipe(
      map(() => res.status(HttpStatus.CREATED).send()),
    );
  }

  @Post('/login')
  @UsePipes(ValidationPipe)
  async login(@Body() loginDto: LoginDto, @Res() res: Response): Promise<any> {
    return this.authService.login(loginDto);
  }
}
