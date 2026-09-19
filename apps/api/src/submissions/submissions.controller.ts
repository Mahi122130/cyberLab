import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';

import { SubmissionsService } from './submissions.service';

@Controller('submissions')
export class SubmissionsController {
  constructor(
    private readonly submissionsService: SubmissionsService,
  ) {}

  @Post()
  async submit(
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

  @Get('user/:userId')
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.submissionsService.findByUser(
      userId,
    );
  }

  @Get()
  async findAll() {
    return this.submissionsService.findAll();
  }
}