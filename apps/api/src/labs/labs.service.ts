
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
|
| IMPORTANT:
| Your challenges table does NOT have slug.
|
| Your actual columns are:
|
| id
| lab_id
| title
| description
| task
| points
| order_number
| is_active
| created_at
|
|--------------------------------------------------------------------------
*/

export type CreateChallengeDto = {
  title: string;
  description?: string;
  task: string;
  points: number;
  order_number?: number;
  is_active?: boolean | number;
};

export type UpdateChallengeDto = {
  title?: string;
  description?: string;
  task?: string;
  points?: number;
  order_number?: number;
  is_active?: boolean | number;
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
     * Delete challenges first because
     * challenges.lab_id references labs.id.
     */

    await this.database.query(
      `
      DELETE FROM challenges
      WHERE lab_id = ?
      `,
      [id],
    );

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
  | This is the endpoint your frontend should use.
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
  | Admin endpoint.
  | Includes inactive challenges.
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

    return {
      success: true,
      challenge: challenges[0],
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

    if (!dto.title?.trim()) {
      throw new BadRequestException(
        'Challenge title is required.',
      );
    }

    if (!dto.task?.trim()) {
      throw new BadRequestException(
        'Challenge task is required.',
      );
    }

    if (
      dto.points === undefined ||
      dto.points < 0
    ) {
      throw new BadRequestException(
        'Challenge points must be a non-negative number.',
      );
    }

    let orderNumber =
      dto.order_number;

    /*
     * Automatically assign the next
     * challenge order if none is provided.
     */

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

    const result: any =
      await this.database.query(
        `
        INSERT INTO challenges (
          lab_id,
          title,
          description,
          task,
          points,
          order_number,
          is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          labId,
          dto.title.trim(),
          dto.description?.trim() || null,
          dto.task.trim(),
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

    const fields: string[] = [];
    const values: any[] = [];

    if (dto.title !== undefined) {
      if (!dto.title.trim()) {
        throw new BadRequestException(
          'Challenge title cannot be empty.',
        );
      }

      fields.push('title = ?');
      values.push(dto.title.trim());
    }

    if (dto.description !== undefined) {
      fields.push('description = ?');
      values.push(
        dto.description?.trim() || null,
      );
    }

    if (dto.task !== undefined) {
      if (!dto.task.trim()) {
        throw new BadRequestException(
          'Challenge task cannot be empty.',
        );
      }

      fields.push('task = ?');
      values.push(dto.task.trim());
    }

    if (dto.points !== undefined) {
      if (dto.points < 0) {
        throw new BadRequestException(
          'Challenge points cannot be negative.',
        );
      }

      fields.push('points = ?');
      values.push(dto.points);
    }

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
  | INTERNAL HELPER
  |--------------------------------------------------------------------------
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
}
