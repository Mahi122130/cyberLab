import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

import { SubmissionsService } from './submissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('submissions')
export class SubmissionsController {
  constructor(
    private readonly submissionsService: SubmissionsService,
  ) {}

  // ==========================================
  // SUBMIT A FLAG
  // POST /api/v1/submissions
  // Requires: authenticated student
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Post()
  async submit(
    @Request() req: any,
    @Body()
    body: {
      userId: number;
      challengeId: number;
      flag: string;
    },
  ) {
    if (
      !body.userId ||
      !body.challengeId ||
      !body.flag
    ) {
      throw new BadRequestException(
        'userId, challengeId and flag are required',
      );
    }

    return this.submissionsService.submitFlag(
      Number(body.userId),
      Number(body.challengeId),
      body.flag,
    );
  }

  // ==========================================
  // GET MY SUBMISSIONS
  // GET /api/v1/submissions/user/:userId
  // Requires: authenticated user (own submissions)
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.submissionsService.findByUser(userId);
  }

  // ==========================================
  // GET ALL SUBMISSIONS (ADMIN ONLY)
  // GET /api/v1/submissions
  // Requires: ADMIN role
  // ==========================================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  async findAll() {
    return this.submissionsService.findAll();
  }
}