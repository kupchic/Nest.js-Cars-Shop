import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard, RefreshTokenGuard } from './guards';
import { ResetPassDto } from './dto/reset-pass.dto';
import { Tokens } from './types/tokens';
import { User } from '../user/user.schema';
import { ChangePassDto } from './dto/change-pass.dto';
import { GetCurrentUser, Public } from '../common/decorators';

@ApiTags('Auth Module')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('/register')
  async register(@Body() registerDTO: RegisterDto): Promise<void> {
    return this.authService.registerUser(registerDTO);
  }

  @ApiResponse({
    type: Tokens,
  })
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@GetCurrentUser() user: User): Promise<Tokens> {
    return this.authService.login(user);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/logout')
  async logout(@GetCurrentUser('id') userId: string): Promise<void> {
    return this.authService.logout(userId);
  }

  @ApiResponse({
    type: Tokens,
  })
  @HttpCode(HttpStatus.OK)
  @Put('/change-password')
  async changePassword(
    @Body() dto: ChangePassDto,
    @GetCurrentUser() user: User,
  ): Promise<Tokens> {
    return this.authService.changePassword(dto, user);
  }

  @ApiResponse({
    type: Tokens,
  })
  @Public()
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/refresh')
  async refreshTokens(
    @GetCurrentUser('id') userId: string,
    @GetCurrentUser('refresh_token') rt: string,
  ): Promise<Tokens> {
    return this.authService.refreshTokens(userId, rt);
  }

  @Public()
  @Post('/forgot-password/:email')
  async sendLink(@Param('email') email: string): Promise<void> {
    return this.authService.resetPassSendLink(email);
  }

  @Public()
  @Put('/reset-password/:id/:token')
  async forgotPass(
    @Body() resetPassDTO: ResetPassDto,
    @Param() { id, token }: { id: string; token: string },
  ): Promise<void> {
    return this.authService.resetUserPassword(resetPassDTO, id, token);
  }
}
