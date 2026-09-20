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

import * as labsService_1 from './labs.service';

import { CreateLabDto } from './dto/create-lab.dto';
import { UpdateLabDto } from './dto/update-lab.dto';

@Controller('labs')
export class LabsController {
  constructor(
    private readonly labsService: labsService_1.LabsService,
  ) {}

  // =========================================================
  // LABS
  // =========================================================

  /*
   * POST /labs
   *
   * Create a new lab.
   */
  @Post()
  async create(
    @Body() dto: CreateLabDto,
  ) {
    return this.labsService.create(dto);
  }

  /*
   * GET /labs
   *
   * Get all labs.
   */
  @Get()
  async findAll() {
    return this.labsService.findAll();
  }

  /*
   * GET /labs/active
   *
   * Get only active labs.
   */
  @Get('active')
  async findActiveLabs() {
    return this.labsService.findActiveLabs();
  }

  /*
   * GET /labs/slug/:slug
   *
   * Get a lab by slug.
   */
  @Get('slug/:slug')
  async findBySlug(
    @Param('slug') slug: string,
  ) {
    return this.labsService.findBySlug(slug);
  }

  /*
   * GET /labs/hints/all
   *
   * Get all hints across all labs and challenges.
   */
  @Get('hints/all')
  async getAllHints() {
    return this.labsService.getAllHints();
  }

  /*
   * POST /labs/hints
   *
   * Create a hint for a challenge.
   */
  @Post('hints')
  async createHint(
    @Body() body: { challenge_id: number; hint_text: string; hint_order?: number },
  ) {
    return this.labsService.createHint(body.challenge_id, body.hint_text, body.hint_order);
  }

  /*
   * PUT /labs/hints/:id
   *
   * Update a hint text or order.
   */
  @Put('hints/:id')
  async updateHint(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { hint_text?: string; hint_order?: number },
  ) {
    return this.labsService.updateHint(id, body.hint_text, body.hint_order);
  }

  /*
   * DELETE /labs/hints/:id
   *
   * Delete a hint.
   */
  @Delete('hints/:id')
  async deleteHint(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.labsService.deleteHint(id);
  }

  /*
   * GET /labs/resources/all
   *
   * Get all resources across all labs.
   */
  @Get('resources/all')
  async getAllResources() {
    return this.labsService.getAllResources();
  }

  /*
   * GET /labs/:labId/resources
   *
   * Get resources for a specific lab.
   */
  @Get(':labId/resources')
  async getLabResources(
    @Param('labId', ParseIntPipe) labId: number,
  ) {
    return this.labsService.getLabResources(labId);
  }

  /*
   * POST /labs/resources
   *
   * Create a learning resource for a lab.
   */
  @Post('resources')
  async createResource(
    @Body() body: { lab_id: number; title: string; url?: string; description?: string; resource_type?: string },
  ) {
    return this.labsService.createResource(body);
  }

  /*
   * PUT /labs/resources/:id
   *
   * Update a learning resource.
   */
  @Put('resources/:id')
  async updateResource(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { lab_id?: number; title?: string; url?: string; description?: string; resource_type?: string },
  ) {
    return this.labsService.updateResource(id, body);
  }

  /*
   * DELETE /labs/resources/:id
   *
   * Delete a learning resource.
   */
  @Delete('resources/:id')
  async deleteResource(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.labsService.deleteResource(id);
  }

  /*
   * GET /labs/:id
   *
   * Get one lab.
   *
   * IMPORTANT:
   * This route is placed after the more specific
   * /active and /slug/:slug routes.
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.labsService.findOne(id);
  }

  /*
   * PUT /labs/:id
   *
   * Update a lab.
   */
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

  /*
   * PATCH /labs/:id/status
   *
   * Activate/deactivate a lab.
   */
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

  /*
   * DELETE /labs/:id
   *
   * Delete a lab and its challenges/submissions.
   */
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.labsService.remove(id);
  }

  // =========================================================
  // CHALLENGES
  // =========================================================

  /*
   * GET /labs/:labId/challenges
   *
   * STUDENT ENDPOINT
   *
   * Returns active challenges.
   * The flag is NOT returned.
   */
  @Get(':labId/challenges')
  async findChallenges(
    @Param('labId', ParseIntPipe)
    labId: number,
  ) {
    return this.labsService.findChallenges(
      labId,
    );
  }

  /*
   * GET /labs/:labId/challenges/all
   *
   * ADMIN ENDPOINT
   *
   * Returns active + inactive challenges.
   * The flag is NOT returned here either.
   */
  @Get(':labId/challenges/all')
  async findAllChallenges(
    @Param('labId', ParseIntPipe)
    labId: number,
  ) {
    return this.labsService.findAllChallenges(
      labId,
    );
  }

  /*
   * GET /labs/:labId/challenges/:challengeId
   *
   * Get one challenge.
   *
   * The flag is intentionally NOT returned.
   */
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

  /*
   * POST /labs/:labId/challenges
   *
   * Create a challenge.
   *
   * Body now supports:
   *
   * {
   *   "title": "...",
   *   "description": "...",
   *   "task": "...",
   *   "flag": "CYBERLAB{...}",
   *   "points": 100,
   *   "order_number": 1,
   *   "is_active": true
   * }
   */
  @Post(':labId/challenges')
  async createChallenge(
    @Param('labId', ParseIntPipe)
    labId: number,

    @Body() dto: labsService_1.CreateChallengeDto,
  ) {
    return this.labsService.createChallenge(
      labId,
      dto,
    );
  }

  /*
   * PUT /labs/:labId/challenges/:challengeId
   *
   * Update a challenge.
   *
   * The flag can also be updated.
   */
  @Put(':labId/challenges/:challengeId')
  async updateChallenge(
    @Param('labId', ParseIntPipe)
    labId: number,

    @Param('challengeId', ParseIntPipe)
    challengeId: number,

    @Body() dto: labsService_1.UpdateChallengeDto,
  ) {
    return this.labsService.updateChallenge(
      labId,
      challengeId,
      dto,
    );
  }

  /*
   * PATCH /labs/:labId/challenges/:challengeId/status
   *
   * Activate/deactivate a challenge.
   */
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

  /*
   * DELETE /labs/:labId/challenges/:challengeId
   *
   * Delete a challenge and its submissions.
   */
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