import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async submitFlag(
    userId: number,
    challengeId: number,
    submittedFlag: string,
  ) {
    if (!submittedFlag?.trim()) {
      throw new BadRequestException(
        'Flag is required',
      );
    }

    const challenges = await this.databaseService.query(
      `
      SELECT
        id,
        lab_id,
        title,
        points,
        is_active,
        flag
      FROM challenges
      WHERE id = ?
      LIMIT 1
      `,
      [challengeId],
    );

    if (challenges.length === 0) {
      throw new NotFoundException(
        'Challenge not found',
      );
    }

    const challenge = challenges[0];

    if (
      challenge.is_active !== 1 &&
      challenge.is_active !== true
    ) {
      throw new BadRequestException(
        'Challenge is not active',
      );
    }

    const normalizedSubmitted =
      submittedFlag.trim();

    const correct =
      normalizedSubmitted === challenge.flag;

    if (correct) {
      // Check if user already solved this challenge
      const previousCorrect = await this.databaseService.query<any[]>(
        `
        SELECT id FROM submissions
        WHERE user_id = ? AND challenge_id = ? AND is_correct = 1
        LIMIT 1
        `,
        [userId, challengeId]
      );

      const alreadySolved = previousCorrect.length > 0;

      await this.databaseService.query(
        `
        INSERT INTO submissions
          (
            user_id,
            challenge_id,
            submitted_flag,
            is_correct
          )
        VALUES (?, ?, ?, ?)
        `,
        [userId, challengeId, normalizedSubmitted, 1]
      );

      if (!alreadySolved) {
        // Award points
        await this.databaseService.query(
          `
          UPDATE users
          SET points = points + ?
          WHERE id = ?
          `,
          [challenge.points, userId]
        );
        
        return {
          success: true,
          correct: true,
          message: 'Correct flag! Challenge completed and points awarded.',
          points: challenge.points,
          awarded: true,
        };
      } else {
        return {
          success: true,
          correct: true,
          message: 'Correct flag! However, you have already solved this challenge.',
          points: 0,
          awarded: false,
        };
      }
    } else {
      await this.databaseService.query(
        `
        INSERT INTO submissions
          (
            user_id,
            challenge_id,
            submitted_flag,
            is_correct
          )
        VALUES (?, ?, ?, ?)
        `,
        [userId, challengeId, normalizedSubmitted, 0]
      );

      return {
        success: false,
        correct: false,
        message: 'Incorrect flag',
      };
    }
  }

  async findByUser(userId: number) {
    return this.databaseService.query(
      `
      SELECT
        s.id,
        s.challenge_id,
        c.title AS challenge_title,
        s.is_correct,
        s.submitted_at AS created_at
      FROM submissions s
      INNER JOIN challenges c
        ON c.id = s.challenge_id
      WHERE s.user_id = ?
      ORDER BY s.submitted_at DESC
      `,
      [userId],
    );
  }

  async findAll() {
    return this.databaseService.query(
      `
      SELECT
        s.id,
        s.user_id,
        u.username,
        s.challenge_id,
        c.title AS challenge_title,
        s.submitted_flag,
        s.is_correct,
        s.submitted_at AS created_at
      FROM submissions s
      INNER JOIN users u
        ON u.id = s.user_id
      INNER JOIN challenges c
        ON c.id = s.challenge_id
      ORDER BY s.submitted_at DESC
      `,
    );
  }
}