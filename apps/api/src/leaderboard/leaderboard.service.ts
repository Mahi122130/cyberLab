import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class LeaderboardService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getLeaderboard(limit: number = 50) {
    // Ranks users based on their points
    return this.databaseService.query(
      `
      SELECT 
        u.id,
        u.id AS user_id,
        u.username,
        u.points,
        (SELECT COUNT(DISTINCT s.challenge_id) FROM submissions s WHERE s.user_id = u.id AND s.is_correct = 1) AS challenges_solved,
        RANK() OVER (ORDER BY u.points DESC) as 'rank'
      FROM users u
      WHERE u.role = 'STUDENT'
      ORDER BY u.points DESC
      LIMIT ?
      `,
      [limit]
    );
  }
}
