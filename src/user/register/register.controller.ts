import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UserService } from '../user.service';
import { from, map, Observable } from 'rxjs';
import { Response } from 'express';

@Controller('register')
export class RegisterController {
  constructor(private userService: UserService) {}
  @Post()
  register(
    @Body() registerDTO: RegisterDto,
    @Res() res: Response,
  ): Observable<Response> {
    return from(this.userService.registerUser(registerDTO)).pipe(
      map(() => res.status(HttpStatus.CREATED).location('/login')),
    );
  }
}
