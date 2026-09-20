import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  // ==========================================
  // GET MY STATS / KPIs
  // GET /api/v1/users/me/stats
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Get('me/stats')
  async getMyStats(@Request() req: any) {
    return this.usersService.getMyStats(req.user.id);
  }

  // ==========================================
  // GET MY PROGRESS
  // GET /api/v1/users/me/progress
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Get('me/progress')
  async getMyProgress(@Request() req: any) {
    return this.usersService.getMyProgress(req.user.id);
  }

  // ==========================================
  // UPDATE MY SETTINGS
  // PATCH /api/v1/users/me
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(
    @Request() req: any,
    @Body()
    body: {
      username?: string;
      currentPassword?: string;
      newPassword?: string;
    },
  ) {
    return this.usersService.updateMe(req.user.id, body);
  }

  // ==========================================
  // GET ALL USERS (ADMIN ONLY)
  // GET /api/v1/users
  // ==========================================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  // ==========================================
  // GET USER BY ID (ADMIN ONLY)
  // GET /api/v1/users/:id
  // ==========================================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.findById(id);
  }

  // ==========================================
  // REGISTER
  // POST /api/v1/users
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
  // POST /api/v1/users/login
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