import {
  BadRequestException,
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  async login(
    @Body()
    body: {
      email?: string;
      username?: string;
      usernameOrEmail?: string;
      password: string;
    },
  ) {
    const identifier = (
      body.usernameOrEmail ||
      body.email ||
      body.username ||
      ''
    ).trim();

    if (!identifier || !body.password) {
      throw new BadRequestException(
        'Email/username and password are required',
      );
    }

    return this.authService.login(
      identifier,
      body.password,
    );
  }
}