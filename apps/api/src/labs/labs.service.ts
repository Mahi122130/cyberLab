import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

/*
|--------------------------------------------------------------------------
| LAB DTOs
|--------------------------------------------------------------------------
*/

export type CreateLabDto = {
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  points: number;
  target_type: 'WEB' | 'LINUX' | 'NETWORK' | 'CRYPTO';
  target_url?: string | null;
  docker_image?: string | null;
};

export type UpdateLabDto = {
  title?: string;
  slug?: string;
  description?: string;
  category?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  points?: number;
  target_type?: 'WEB' | 'LINUX' | 'NETWORK' | 'CRYPTO';
  target_url?: string | null;
  docker_image?: string | null;
  is_active?: boolean | number;
};

/*
|--------------------------------------------------------------------------
| CHALLENGE DTOs
|--------------------------------------------------------------------------
*/

export type ChallengeHintDto = {
  hint_text: string;
  hint_order?: number;
};

export type CreateChallengeDto = {
  title: string;
  description?: string;
  task: string;
  flag: string;
  points: number;
  order_number?: number;
  is_active?: boolean | number;
  hints?: ChallengeHintDto[];
};

export type UpdateChallengeDto = {
  title?: string;
  description?: string;
  task?: string;
  flag?: string;
  points?: number;
  order_number?: number;
  is_active?: boolean | number;
  hints?: ChallengeHintDto[];
};

@Injectable()
export class LabsService {
  constructor(
    private readonly database: DatabaseService,
  ) {}

  /*
  |--------------------------------------------------------------------------
  | CREATE LAB
  |--------------------------------------------------------------------------
  | POST /labs
  |--------------------------------------------------------------------------
  */

  async create(dto: CreateLabDto) {
    if (!dto.title?.trim()) {
      throw new BadRequestException(
        'Lab title is required.',
      );
    }

    if (!dto.slug?.trim()) {
      throw new BadRequestException(
        'Lab slug is required.',
      );
    }

    if (!dto.description?.trim()) {
      throw new BadRequestException(
        'Lab description is required.',
      );
    }

    if (
      dto.points === undefined ||
      dto.points < 0
    ) {
      throw new BadRequestException(
        'Lab points must be a non-negative number.',
      );
    }

    const existing =
      await this.database.query<any[]>(
        `
        SELECT id
        FROM labs
        WHERE slug = ?
        LIMIT 1
        `,
        [dto.slug.trim()],
      );

    if (existing.length > 0) {
      throw new BadRequestException(
        'A lab with this slug already exists.',
      );
    }

    const result: any =
      await this.database.query(
        `
        INSERT INTO labs (
          title,
          slug,
          description,
          category,
          difficulty,
          points,
          target_type,
          target_url,
          docker_image,
          is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          dto.title.trim(),
          dto.slug.trim(),
          dto.description.trim(),
          dto.category,
          dto.difficulty,
          dto.points,
          dto.target_type,
          dto.target_url ?? null,
          dto.docker_image ?? null,
          1,
        ],
      );

    const labId = result.insertId;

    return {
      success: true,
      message: 'Lab created successfully.',
      lab: await this.findOne(labId),
    };
  }

  /*
  |--------------------------------------------------------------------------
  | GET ALL LABS
  |--------------------------------------------------------------------------
  | GET /labs
  |--------------------------------------------------------------------------
  */

  async findAll() {
    const labs =
      await this.database.query<any[]>(
        `
        SELECT
          id,
          title,
          slug,
          description,
          category,
          difficulty,
          points,
          target_type,
          target_url,
          docker_image,
          is_active,
          created_at
        FROM labs
        ORDER BY created_at DESC
        `,
      );

    return {
      success: true,
      labs,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | GET ACTIVE LABS
  |--------------------------------------------------------------------------
  | GET /labs/active
  |--------------------------------------------------------------------------
  */

  async findActiveLabs() {
    const labs =
      await this.database.query<any[]>(
        `
        SELECT
          id,
          title,
          slug,
          description,
          category,
          difficulty,
          points,
          target_type,
          target_url,
          docker_image,
          is_active,
          created_at
        FROM labs
        WHERE is_active = 1
        ORDER BY created_at DESC
        `,
      );

    return {
      success: true,
      labs,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | GET LAB BY SLUG
  |--------------------------------------------------------------------------
  | GET /labs/slug/:slug
  |--------------------------------------------------------------------------
  */

  async findBySlug(slug: string) {
    const labs =
      await this.database.query<any[]>(
        `
        SELECT
          id,
          title,
          slug,
          description,
          category,
          difficulty,
          points,
          target_type,
          target_url,
          docker_image,
          is_active,
          created_at
        FROM labs
        WHERE slug = ?
        LIMIT 1
        `,
        [slug],
      );

    if (labs.length === 0) {
      throw new NotFoundException(
        `Lab with slug "${slug}" not found.`,
      );
    }

    return {
      success: true,
      lab: labs[0],
    };
  }

  /*
  |--------------------------------------------------------------------------
  | GET ONE LAB
  |--------------------------------------------------------------------------
  | GET /labs/:id
  |--------------------------------------------------------------------------
  */

  async findOne(id: number) {
    const labs =
      await this.database.query<any[]>(
        `
        SELECT
          id,
          title,
          slug,
          description,
          category,
          difficulty,
          points,
          target_type,
          target_url,
          docker_image,
          is_active,
          created_at
        FROM labs
        WHERE id = ?
        LIMIT 1
        `,
        [id],
      );

    if (labs.length === 0) {
      throw new NotFoundException(
        `Lab with ID ${id} not found.`,
      );
    }

    return labs[0];
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE LAB
  |--------------------------------------------------------------------------
  | PUT /labs/:id
  |--------------------------------------------------------------------------
  */

  async update(
    id: number,
    dto: UpdateLabDto,
  ) {
    await this.findOne(id);

    if (dto.slug !== undefined) {
      const existing =
        await this.database.query<any[]>(
          `
          SELECT id
          FROM labs
          WHERE slug = ?
          AND id != ?
          LIMIT 1
          `,
          [
            dto.slug.trim(),
            id,
          ],
        );

      if (existing.length > 0) {
        throw new BadRequestException(
          'Another lab already uses this slug.',
        );
      }
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (dto.title !== undefined) {
      fields.push('title = ?');
      values.push(dto.title.trim());
    }

    if (dto.slug !== undefined) {
      fields.push('slug = ?');
      values.push(dto.slug.trim());
    }

    if (dto.description !== undefined) {
      fields.push('description = ?');
      values.push(dto.description.trim());
    }

    if (dto.category !== undefined) {
      fields.push('category = ?');
      values.push(dto.category);
    }

    if (dto.difficulty !== undefined) {
      fields.push('difficulty = ?');
      values.push(dto.difficulty);
    }

    if (dto.points !== undefined) {
      if (dto.points < 0) {
        throw new BadRequestException(
          'Points cannot be negative.',
        );
      }

      fields.push('points = ?');
      values.push(dto.points);
    }

    if (dto.target_type !== undefined) {
      fields.push('target_type = ?');
      values.push(dto.target_type);
    }

    if (dto.target_url !== undefined) {
      fields.push('target_url = ?');
      values.push(dto.target_url);
    }

    if (dto.docker_image !== undefined) {
      fields.push('docker_image = ?');
      values.push(dto.docker_image);
    }

    if (dto.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(
        dto.is_active ? 1 : 0,
      );
    }

    if (fields.length === 0) {
      throw new BadRequestException(
        'No fields were provided for update.',
      );
    }

    values.push(id);

    await this.database.query(
      `
      UPDATE labs
      SET ${fields.join(', ')}
      WHERE id = ?
      `,
      values,
    );

    return {
      success: true,
      message: 'Lab updated successfully.',
      lab: await this.findOne(id),
    };
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE LAB STATUS
  |--------------------------------------------------------------------------
  | PATCH /labs/:id/status
  |--------------------------------------------------------------------------
  */

  async updateStatus(
    id: number,
    isActive: boolean,
  ) {
    await this.findOne(id);

    await this.database.query(
      `
      UPDATE labs
      SET is_active = ?
      WHERE id = ?
      `,
      [
        isActive ? 1 : 0,
        id,
      ],
    );

    return {
      success: true,
      message: isActive
        ? 'Lab activated successfully.'
        : 'Lab deactivated successfully.',
      lab: await this.findOne(id),
    };
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE LAB
  |--------------------------------------------------------------------------
  | DELETE /labs/:id
  |--------------------------------------------------------------------------
  */

  async remove(id: number) {
    await this.findOne(id);

    /*
     * Delete submissions belonging to
     * challenges in this lab first.
     */

    await this.database.query(
      `
      DELETE FROM submissions
      WHERE challenge_id IN (
        SELECT id
        FROM challenges
        WHERE lab_id = ?
      )
      `,
      [id],
    );

    /*
     * Delete challenges belonging to the lab.
     *
     * challenge_hints are automatically deleted
     * because of ON DELETE CASCADE.
     */

    await this.database.query(
      `
      DELETE FROM challenges
      WHERE lab_id = ?
      `,
      [id],
    );

    /*
     * Delete the lab.
     */

    await this.database.query(
      `
      DELETE FROM labs
      WHERE id = ?
      `,
      [id],
    );

    return {
      success: true,
      message: 'Lab deleted successfully.',
    };
  }

  /*
  |--------------------------------------------------------------------------
  | GET ACTIVE CHALLENGES
  |--------------------------------------------------------------------------
  | GET /labs/:labId/challenges
  |--------------------------------------------------------------------------
  |
  | STUDENT ENDPOINT
  |
  | IMPORTANT:
  | The flag is NEVER returned.
  | Hints are also not returned here because
  | this endpoint is only used for the challenge list.
  |
  */

  async findChallenges(
    labId: number,
  ) {
    await this.findOne(labId);

    const challenges =
      await this.database.query<any[]>(
        `
        SELECT
          id,
          lab_id,
          title,
          description,
          task,
          points,
          order_number,
          is_active,
          created_at
        FROM challenges
        WHERE lab_id = ?
        AND is_active = 1
        ORDER BY
          order_number ASC,
          created_at ASC
        `,
        [labId],
      );

    return {
      success: true,
      lab_id: labId,
      challenges,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | GET ALL CHALLENGES
  |--------------------------------------------------------------------------
  | GET /labs/:labId/challenges/all
  |--------------------------------------------------------------------------
  |
  | ADMIN ENDPOINT
  |
  | The flag is intentionally NOT returned here.
  |
  */

  async findAllChallenges(
    labId: number,
  ) {
    await this.findOne(labId);

    const challenges =
      await this.database.query<any[]>(
        `
        SELECT
          id,
          lab_id,
          title,
          description,
          task,
          points,
          order_number,
          is_active,
          created_at
        FROM challenges
        WHERE lab_id = ?
        ORDER BY
          order_number ASC,
          created_at ASC
        `,
        [labId],
      );

    return {
      success: true,
      lab_id: labId,
      challenges,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | GET ONE CHALLENGE
  |--------------------------------------------------------------------------
  | GET /labs/:labId/challenges/:challengeId
  |--------------------------------------------------------------------------
  |
  | STUDENT ENDPOINT
  |
  | Returns:
  | - challenge information
  | - hints
  |
  | NEVER returns:
  | - flag
  |
  */

  async findChallenge(
    labId: number,
    challengeId: number,
  ) {
    await this.findOne(labId);

    const challenges =
      await this.database.query<any[]>(
        `
        SELECT
          id,
          lab_id,
          title,
          description,
          task,
          points,
          order_number,
          is_active,
          created_at
        FROM challenges
        WHERE id = ?
        AND lab_id = ?
        LIMIT 1
        `,
        [
          challengeId,
          labId,
        ],
      );

    if (challenges.length === 0) {
      throw new NotFoundException(
        `Challenge with ID ${challengeId} was not found in lab ${labId}.`,
      );
    }

    const hints =
      await this.database.query<any[]>(
        `
        SELECT
          id,
          hint_text,
          hint_order
        FROM challenge_hints
        WHERE challenge_id = ?
        ORDER BY
          hint_order ASC,
          id ASC
        `,
        [challengeId],
      );

    return {
      success: true,
      challenge: {
        ...challenges[0],
        hints,
      },
    };
  }

  /*
  |--------------------------------------------------------------------------
  | CREATE CHALLENGE
  |--------------------------------------------------------------------------
  | POST /labs/:labId/challenges
  |--------------------------------------------------------------------------
  */

  async createChallenge(
    labId: number,
    dto: CreateChallengeDto,
  ) {
    await this.findOne(labId);

    /*
     * Validate title.
     */

    if (!dto.title?.trim()) {
      throw new BadRequestException(
        'Challenge title is required.',
      );
    }

    /*
     * Validate task.
     */

    if (!dto.task?.trim()) {
      throw new BadRequestException(
        'Challenge task is required.',
      );
    }

    /*
     * Validate flag.
     */

    if (!dto.flag?.trim()) {
      throw new BadRequestException(
        'Challenge flag is required.',
      );
    }

    /*
     * Validate points.
     */

    if (
      dto.points === undefined ||
      dto.points < 0
    ) {
      throw new BadRequestException(
        'Challenge points must be a non-negative number.',
      );
    }

    /*
     * Validate hints.
     */

    this.validateHints(dto.hints);

    /*
     * Determine challenge order.
     */

    let orderNumber =
      dto.order_number;

    if (orderNumber === undefined) {
      const result =
        await this.database.query<any[]>(
          `
          SELECT
            COALESCE(
              MAX(order_number),
              0
            ) + 1 AS next_order
          FROM challenges
          WHERE lab_id = ?
          `,
          [labId],
        );

      orderNumber =
        Number(
          result[0]?.next_order,
        ) || 1;
    }

    /*
     * Create challenge.
     */

    const result: any =
      await this.database.query(
        `
        INSERT INTO challenges (
          lab_id,
          title,
          description,
          task,
          flag,
          points,
          order_number,
          is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          labId,
          dto.title.trim(),
          dto.description?.trim() || null,
          dto.task.trim(),
          dto.flag.trim(),
          dto.points,
          orderNumber,
          dto.is_active === undefined
            ? 1
            : dto.is_active
              ? 1
              : 0,
        ],
      );

    const challengeId =
      result.insertId;

    /*
     * Save hints.
     */

    await this.replaceChallengeHints(
      challengeId,
      dto.hints,
    );

    return {
      success: true,
      message:
        'Challenge created successfully.',
      challenge:
        await this.getChallengeById(
          challengeId,
          labId,
        ),
    };
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE CHALLENGE
  |--------------------------------------------------------------------------
  | PUT /labs/:labId/challenges/:challengeId
  |--------------------------------------------------------------------------
  */

  async updateChallenge(
    labId: number,
    challengeId: number,
    dto: UpdateChallengeDto,
  ) {
    await this.findChallenge(
      labId,
      challengeId,
    );

    /*
     * Validate hints when supplied.
     */

    this.validateHints(dto.hints);

    const fields: string[] = [];
    const values: any[] = [];

    /*
     * Title.
     */

    if (dto.title !== undefined) {
      if (!dto.title.trim()) {
        throw new BadRequestException(
          'Challenge title cannot be empty.',
        );
      }

      fields.push('title = ?');
      values.push(dto.title.trim());
    }

    /*
     * Description.
     */

    if (dto.description !== undefined) {
      fields.push('description = ?');

      values.push(
        dto.description?.trim() || null,
      );
    }

    /*
     * Task.
     */

    if (dto.task !== undefined) {
      if (!dto.task.trim()) {
        throw new BadRequestException(
          'Challenge task cannot be empty.',
        );
      }

      fields.push('task = ?');
      values.push(dto.task.trim());
    }

    /*
     * Flag.
     */

    if (dto.flag !== undefined) {
      if (!dto.flag.trim()) {
        throw new BadRequestException(
          'Challenge flag cannot be empty.',
        );
      }

      fields.push('flag = ?');
      values.push(dto.flag.trim());
    }

    /*
     * Points.
     */

    if (dto.points !== undefined) {
      if (dto.points < 0) {
        throw new BadRequestException(
          'Challenge points cannot be negative.',
        );
      }

      fields.push('points = ?');
      values.push(dto.points);
    }

    /*
     * Order number.
     */

    if (
      dto.order_number !== undefined
    ) {
      if (dto.order_number < 0) {
        throw new BadRequestException(
          'Order number cannot be negative.',
        );
      }

      fields.push('order_number = ?');

      values.push(
        dto.order_number,
      );
    }

    /*
     * Active status.
     */

    if (dto.is_active !== undefined) {
      fields.push('is_active = ?');

      values.push(
        dto.is_active ? 1 : 0,
      );
    }

    /*
     * Update challenge fields when supplied.
     */

    if (fields.length > 0) {
      values.push(
        challengeId,
        labId,
      );

      await this.database.query(
        `
        UPDATE challenges
        SET ${fields.join(', ')}
        WHERE id = ?
        AND lab_id = ?
        `,
        values,
      );
    }

    /*
     * Replace hints when hints were supplied.
     *
     * If hints is undefined, existing hints
     * remain untouched.
     *
     * If hints is [], all existing hints are
     * removed.
     */

    await this.replaceChallengeHints(
      challengeId,
      dto.hints,
    );

    /*
     * Make sure at least something was changed.
     */

    if (
      fields.length === 0 &&
      dto.hints === undefined
    ) {
      throw new BadRequestException(
        'No fields were provided for update.',
      );
    }

    return {
      success: true,
      message:
        'Challenge updated successfully.',
      challenge:
        await this.getChallengeById(
          challengeId,
          labId,
        ),
    };
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE CHALLENGE STATUS
  |--------------------------------------------------------------------------
  | PATCH /labs/:labId/challenges/:challengeId/status
  |--------------------------------------------------------------------------
  */

  async updateChallengeStatus(
    labId: number,
    challengeId: number,
    isActive: boolean,
  ) {
    await this.findChallenge(
      labId,
      challengeId,
    );

    await this.database.query(
      `
      UPDATE challenges
      SET is_active = ?
      WHERE id = ?
      AND lab_id = ?
      `,
      [
        isActive ? 1 : 0,
        challengeId,
        labId,
      ],
    );

    return {
      success: true,
      message: isActive
        ? 'Challenge activated successfully.'
        : 'Challenge deactivated successfully.',
      challenge:
        await this.getChallengeById(
          challengeId,
          labId,
        ),
    };
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE CHALLENGE
  |--------------------------------------------------------------------------
  | DELETE /labs/:labId/challenges/:challengeId
  |--------------------------------------------------------------------------
  */

  async removeChallenge(
    labId: number,
    challengeId: number,
  ) {
    await this.findChallenge(
      labId,
      challengeId,
    );

    /*
     * Delete submissions first because
     * submissions.challenge_id references
     * challenges.id.
     */

    await this.database.query(
      `
      DELETE FROM submissions
      WHERE challenge_id = ?
      `,
      [challengeId],
    );

    /*
     * Delete challenge.
     *
     * challenge_hints are automatically deleted
     * by the foreign key:
     *
     * ON DELETE CASCADE
     */

    await this.database.query(
      `
      DELETE FROM challenges
      WHERE id = ?
      AND lab_id = ?
      `,
      [
        challengeId,
        labId,
      ],
    );

    return {
      success: true,
      message:
        'Challenge deleted successfully.',
    };
  }

  /*
  |--------------------------------------------------------------------------
  | VALIDATE HINTS
  |--------------------------------------------------------------------------
  */

  private validateHints(
    hints?: ChallengeHintDto[],
  ) {
    if (hints === undefined) {
      return;
    }

    if (!Array.isArray(hints)) {
      throw new BadRequestException(
        'Hints must be an array.',
      );
    }

    for (
      let index = 0;
      index < hints.length;
      index++
    ) {
      const hint = hints[index];

      if (!hint) {
        throw new BadRequestException(
          `Hint ${index + 1} is invalid.`,
        );
      }

      if (
        !hint.hint_text?.trim()
      ) {
        throw new BadRequestException(
          `Hint ${index + 1} cannot be empty.`,
        );
      }

      if (
        hint.hint_order !== undefined
      ) {
        const order =
          Number(
            hint.hint_order,
          );

        if (
          !Number.isInteger(order) ||
          order < 1
        ) {
          throw new BadRequestException(
            `Hint ${index + 1} order must be a positive integer.`,
          );
        }
      }
    }
  }

  /*
  |--------------------------------------------------------------------------
  | REPLACE CHALLENGE HINTS
  |--------------------------------------------------------------------------
  |
  | Used by both create and update.
  |
  | undefined:
  |   Keep existing hints unchanged.
  |
  | []:
  |   Remove all existing hints.
  |
  | [ ... ]:
  |   Replace existing hints with the supplied hints.
  |
  */

  private async replaceChallengeHints(
    challengeId: number,
    hints?: ChallengeHintDto[],
  ) {
    if (hints === undefined) {
      return;
    }

    /*
     * Remove existing hints first.
     */

    await this.database.query(
      `
      DELETE FROM challenge_hints
      WHERE challenge_id = ?
      `,
      [challengeId],
    );

    /*
     * Nothing else to insert.
     */

    if (hints.length === 0) {
      return;
    }

    /*
     * Insert the new hints.
     */

    for (
      let index = 0;
      index < hints.length;
      index++
    ) {
      const hint = hints[index];

      if (
        !hint?.hint_text?.trim()
      ) {
        continue;
      }

      const hintOrder =
        hint.hint_order !== undefined
          ? Number(
              hint.hint_order,
            )
          : index + 1;

      await this.database.query(
        `
        INSERT INTO challenge_hints (
          challenge_id,
          hint_text,
          hint_order
        )
        VALUES (?, ?, ?)
        `,
        [
          challengeId,
          hint.hint_text.trim(),
          hintOrder,
        ],
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | INTERNAL HELPER
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  | This intentionally does NOT return:
  |
  | - flag
  | - hints
  |
  | It is mainly used after admin mutations.
  |
  */

  private async getChallengeById(
    challengeId: number,
    labId: number,
  ) {
    const challenges =
      await this.database.query<any[]>(
        `
        SELECT
          id,
          lab_id,
          title,
          description,
          task,
          points,
          order_number,
          is_active,
          created_at
        FROM challenges
        WHERE id = ?
        AND lab_id = ?
        LIMIT 1
        `,
        [
          challengeId,
          labId,
        ],
      );

    if (challenges.length === 0) {
      throw new NotFoundException(
        `Challenge with ID ${challengeId} not found.`,
      );
    }

    return challenges[0];
  }

  /*
  |--------------------------------------------------------------------------
  | HINTS MANAGEMENT
  |--------------------------------------------------------------------------
  */

  async getAllHints() {
    const hints = await this.database.query<any[]>(
      `
      SELECT 
        h.id,
        h.challenge_id,
        h.hint_text,
        h.hint_order,
        h.created_at,
        c.title AS challenge_title,
        c.points AS challenge_points,
        c.lab_id,
        l.title AS lab_title,
        l.category AS lab_category
      FROM challenge_hints h
      JOIN challenges c ON h.challenge_id = c.id
      JOIN labs l ON c.lab_id = l.id
      ORDER BY l.id ASC, c.order_number ASC, h.hint_order ASC, h.id ASC
      `
    );
    return { success: true, hints };
  }

  async createHint(challengeId: number, hintText: string, hintOrder?: number) {
    if (!hintText?.trim()) {
      throw new BadRequestException('Hint text is required.');
    }
    const order = hintOrder !== undefined ? Number(hintOrder) : 1;
    const result: any = await this.database.query(
      `INSERT INTO challenge_hints (challenge_id, hint_text, hint_order) VALUES (?, ?, ?)`,
      [challengeId, hintText.trim(), order]
    );
    return {
      success: true,
      hint: {
        id: result.insertId,
        challenge_id: challengeId,
        hint_text: hintText.trim(),
        hint_order: order,
      },
    };
  }

  async updateHint(hintId: number, hintText?: string, hintOrder?: number) {
    const updates: string[] = [];
    const params: any[] = [];
    if (hintText !== undefined) {
      updates.push('hint_text = ?');
      params.push(hintText.trim());
    }
    if (hintOrder !== undefined) {
      updates.push('hint_order = ?');
      params.push(Number(hintOrder));
    }
    if (updates.length > 0) {
      params.push(hintId);
      await this.database.query(
        `UPDATE challenge_hints SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }
    return { success: true };
  }

  async deleteHint(hintId: number) {
    await this.database.query('DELETE FROM challenge_hints WHERE id = ?', [hintId]);
    return { success: true };
  }

  /*
  |--------------------------------------------------------------------------
  | RESOURCES MANAGEMENT
  |--------------------------------------------------------------------------
  */

  async getAllResources() {
    const resources = await this.database.query<any[]>(
      `
      SELECT
        r.id,
        r.lab_id,
        r.title,
        r.url,
        r.description,
        r.resource_type,
        r.created_at,
        l.title AS lab_title,
        l.category AS lab_category,
        l.difficulty AS lab_difficulty
      FROM lab_resources r
      JOIN labs l ON r.lab_id = l.id
      ORDER BY l.id ASC, r.created_at DESC
      `
    );
    return { success: true, resources };
  }

  async getLabResources(labId: number) {
    const resources = await this.database.query<any[]>(
      `SELECT * FROM lab_resources WHERE lab_id = ? ORDER BY created_at DESC`,
      [labId]
    );
    return { success: true, lab_id: labId, resources };
  }

  async createResource(dto: {
    lab_id: number;
    title: string;
    url?: string;
    description?: string;
    resource_type?: string;
  }) {
    if (!dto.lab_id) throw new BadRequestException('Lab ID is required.');
    if (!dto.title?.trim()) throw new BadRequestException('Resource title is required.');
    const result: any = await this.database.query(
      `INSERT INTO lab_resources (lab_id, title, url, description, resource_type) VALUES (?, ?, ?, ?, ?)`,
      [
        dto.lab_id,
        dto.title.trim(),
        dto.url?.trim() || null,
        dto.description?.trim() || null,
        dto.resource_type || 'DOCUMENTATION',
      ]
    );
    return { success: true, id: result.insertId };
  }

  async updateResource(
    id: number,
    dto: {
      title?: string;
      url?: string;
      description?: string;
      resource_type?: string;
      lab_id?: number;
    }
  ) {
    const updates: string[] = [];
    const params: any[] = [];
    if (dto.title !== undefined) {
      updates.push('title = ?');
      params.push(dto.title.trim());
    }
    if (dto.url !== undefined) {
      updates.push('url = ?');
      params.push(dto.url.trim() || null);
    }
    if (dto.description !== undefined) {
      updates.push('description = ?');
      params.push(dto.description.trim() || null);
    }
    if (dto.resource_type !== undefined) {
      updates.push('resource_type = ?');
      params.push(dto.resource_type);
    }
    if (dto.lab_id !== undefined) {
      updates.push('lab_id = ?');
      params.push(dto.lab_id);
    }
    if (updates.length > 0) {
      params.push(id);
      await this.database.query(
        `UPDATE lab_resources SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }
    return { success: true };
  }

  async deleteResource(id: number) {
    await this.database.query('DELETE FROM lab_resources WHERE id = ?', [id]);
    return { success: true };
  }
}