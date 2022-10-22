import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public-decorator';
import { LocalAuthGuard } from './guards/local.guard';
import { ResetPassDto } from './dto/reset-pass.dto';

@ApiTags('Auth Module')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private userService: UserService,
  ) {}

  @Public()
  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDTO: RegisterDto): any {
    return this.userService.registerUser(registerDTO);
  }

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('/login')
  async login(@Request() req): Promise<any> {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('/reset-password/:email')
  async sendLink(@Param('email') email: string): Promise<any> {
    return this.authService.resetPassSendLink(email);
  }

  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put('/reset-password')
  async updatePass(@Body() resetPassDTO: ResetPassDto): Promise<any> {
    return this.authService.updateUserPassword(resetPassDTO);
  }
}
