import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  // ==========================================
  // GET ALL USERS
  // GET /users
  // ==========================================
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  // ==========================================
  // GET USER BY ID
  // GET /users/:id
  // ==========================================
  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.findById(id);
  }

  // ==========================================
  // REGISTER
  // POST /users
  // ==========================================
  @Post()
  async create(
    @Body()
    body: {
      username: string;
      email: string;
      password: string;
    },
  ) {
    return this.usersService.create(
      body.username,
      body.email,
      body.password,
    );
  }

  // ==========================================
  // LOGIN
  // POST /users/login
  //
  // Login with:
  // - username
  // OR
  // - email
  // ==========================================
  @Post('login')
  async login(
    @Body()
    body: {
      usernameOrEmail: string;
      password: string;
    },
  ) {
    return this.usersService.login(
      body.usernameOrEmail,
      body.password,
    );
  }
}