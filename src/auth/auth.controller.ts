import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { Request, Response } from 'express';
import { from, map } from 'rxjs';
import { RegisterDto } from './dto/register.dto';
import { ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from './guards/local.guard';

@ApiTags('Auth Module')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('/register')
  register(@Body() registerDTO: RegisterDto, @Res() res: Response): any {
    return from(this.userService.registerUser(registerDTO)).pipe(
      map(() => res.status(HttpStatus.CREATED).send()),
    );
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Req() req: Request): Promise<any> {
    return this.authService.login(req.user as any);
  }
}
