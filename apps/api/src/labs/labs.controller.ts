
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';

import { LabsService } from './labs.service';

import { CreateLabDto } from './dto/create-lab.dto';
import { UpdateLabDto } from './dto/update-lab.dto';

import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';

@Controller('labs')
export class LabsController {
  constructor(
    private readonly labsService: LabsService,
  ) {}

  // =========================================================
  // LABS
  // =========================================================

  // POST /labs
  @Post()
  async create(
    @Body() dto: CreateLabDto,
  ) {
    return this.labsService.create(dto);
  }

  // GET /labs
  @Get()
  async findAll() {
    return this.labsService.findAll();
  }

  // GET /labs/active
  @Get('active')
  async findActiveLabs() {
    return this.labsService.findActiveLabs();
  }

  // GET /labs/slug/:slug
  @Get('slug/:slug')
  async findBySlug(
    @Param('slug') slug: string,
  ) {
    return this.labsService.findBySlug(slug);
  }

  // GET /labs/:id
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.labsService.findOne(id);
  }

  // PUT /labs/:id
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLabDto,
  ) {
    return this.labsService.update(
      id,
      dto,
    );
  }

  // PATCH /labs/:id/status
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      is_active: boolean;
    },
  ) {
    return this.labsService.updateStatus(
      id,
      body.is_active,
    );
  }

  // DELETE /labs/:id
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.labsService.remove(id);
  }

  // =========================================================
  // CHALLENGES
  // =========================================================

  // GET /labs/:labId/challenges
  @Get(':labId/challenges')
  async findChallenges(
    @Param('labId', ParseIntPipe)
    labId: number,
  ) {
    return this.labsService.findChallenges(
      labId,
    );
  }

  // GET /labs/:labId/challenges/all
  @Get(':labId/challenges/all')
  async findAllChallenges(
    @Param('labId', ParseIntPipe)
    labId: number,
  ) {
    return this.labsService.findAllChallenges(
      labId,
    );
  }

  // GET /labs/:labId/challenges/:challengeId
  @Get(':labId/challenges/:challengeId')
  async findChallenge(
    @Param('labId', ParseIntPipe)
    labId: number,

    @Param('challengeId', ParseIntPipe)
    challengeId: number,
  ) {
    return this.labsService.findChallenge(
      labId,
      challengeId,
    );
  }

  // POST /labs/:labId/challenges
  @Post(':labId/challenges')
  async createChallenge(
    @Param('labId', ParseIntPipe)
    labId: number,

    @Body() dto: CreateChallengeDto,
  ) {
    return this.labsService.createChallenge(
      labId,
      dto,
    );
  }

  // PUT /labs/:labId/challenges/:challengeId
  @Put(':labId/challenges/:challengeId')
  async updateChallenge(
    @Param('labId', ParseIntPipe)
    labId: number,

    @Param('challengeId', ParseIntPipe)
    challengeId: number,

    @Body() dto: UpdateChallengeDto,
  ) {
    return this.labsService.updateChallenge(
      labId,
      challengeId,
      dto,
    );
  }

  // PATCH /labs/:labId/challenges/:challengeId/status
  @Patch(':labId/challenges/:challengeId/status')
  async updateChallengeStatus(
    @Param('labId', ParseIntPipe)
    labId: number,

    @Param('challengeId', ParseIntPipe)
    challengeId: number,

    @Body()
    body: {
      is_active: boolean;
    },
  ) {
    return this.labsService.updateChallengeStatus(
      labId,
      challengeId,
      body.is_active,
    );
  }

  // DELETE /labs/:labId/challenges/:challengeId
  @Delete(':labId/challenges/:challengeId')
  async removeChallenge(
    @Param('labId', ParseIntPipe)
    labId: number,

    @Param('challengeId', ParseIntPipe)
    challengeId: number,
  ) {
    return this.labsService.removeChallenge(
      labId,
      challengeId,
    );
  }
}
