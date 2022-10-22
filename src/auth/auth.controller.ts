import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { Response } from 'express';
import { from, map } from 'rxjs';
import { RegisterDto } from './dto/register.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public-decorator';
import { LocalAuthGuard } from './guards/local.guard';

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

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('/login')
  async login(@Request() req): Promise<any> {
    return this.authService.login(req.user);
  }
}
