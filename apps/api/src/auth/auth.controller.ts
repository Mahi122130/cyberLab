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
      email: string;
      password: string;
    },
  ) {
    if (!body.email || !body.password) {
      throw new BadRequestException(
        'Email and password are required',
      );
    }

    const email = body.email.trim().toLowerCase();

    if (!email.includes('@')) {
      throw new BadRequestException(
        'Please provide a valid email address',
      );
    }

    return this.authService.login(
      email,
      body.password,
    );
  }
}