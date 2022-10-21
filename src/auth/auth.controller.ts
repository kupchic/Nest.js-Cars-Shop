import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { Response } from 'express';
import { from, map } from 'rxjs';
import { RegisterDto } from './dto/register.dto';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { Public } from '../common/decorators/public-decorator';

@ApiTags('Auth Module')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private userService: UserService,
  ) {}

  @Public()
  @Post('/register')
  register(@Body() registerDTO: RegisterDto, @Res() res: Response): any {
    return from(this.userService.registerUser(registerDTO)).pipe(
      map(() => res.status(HttpStatus.CREATED).send()),
    );
  }

  @Public()
  @Post('/login')
  async login(@Body() body: LoginDto): Promise<any> {
    return this.authService.login(body);
  }
}
