import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { DatabaseService } from '../database/database.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  // ==========================================
  // GET ALL USERS
  // GET /users
  // ==========================================
  async findAll() {
    return this.databaseService.query(`
      SELECT
        id,
        username,
        email,
        role,
        points,
        level,
        created_at
      FROM users
      ORDER BY id DESC
    `);
  }

  // ==========================================
  // GET USER BY ID
  // GET /users/:id
  // ==========================================
  async findById(id: number) {
    const users =
      await this.databaseService.query(
        `
        SELECT
          id,
          username,
          email,
          role,
          points,
          level,
          created_at
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [id],
      );

    return users.length > 0
      ? users[0]
      : null;
  }

  // ==========================================
  // GET USER STATISTICS / KPIs
  // GET /users/me/stats
  // ==========================================
  async getMyStats(userId: number) {
    const userRows = await this.databaseService.query(
      `SELECT id, username, email, role, points, level, created_at FROM users WHERE id = ? LIMIT 1`,
      [userId],
    );

    if (userRows.length === 0) {
      throw new NotFoundException('User not found');
    }

    const user = userRows[0];

    // Total challenges solved (unique)
    const solvedRows = await this.databaseService.query(
      `SELECT COUNT(DISTINCT challenge_id) AS total FROM submissions WHERE user_id = ? AND is_correct = 1`,
      [userId],
    );

    // Total labs completed (labs where all challenges are solved)
    const labsCompletedRows = await this.databaseService.query(
      `
      SELECT COUNT(*) AS total FROM (
        SELECT l.id
        FROM labs l
        INNER JOIN challenges c ON c.lab_id = l.id AND c.is_active = 1
        LEFT JOIN submissions s ON s.challenge_id = c.id AND s.user_id = ? AND s.is_correct = 1
        GROUP BY l.id
        HAVING COUNT(c.id) > 0 AND COUNT(c.id) = COUNT(s.id)
      ) AS completed_labs
      `,
      [userId],
    );

    // Global rank
    const rankRows = await this.databaseService.query(
      `SELECT COUNT(*) + 1 AS \`rank\` FROM users WHERE points > ? AND role = 'STUDENT'`,
      [user.points],
    );

    // Total students
    const totalStudentsRows = await this.databaseService.query(
      `SELECT COUNT(*) AS total FROM users WHERE role = 'STUDENT'`,
    );

    // Recent submissions
    const recentRows = await this.databaseService.query(
      `
      SELECT s.id, c.title AS challenge_title, s.is_correct, s.submitted_at AS created_at
      FROM submissions s
      INNER JOIN challenges c ON c.id = s.challenge_id
      WHERE s.user_id = ?
      ORDER BY s.submitted_at DESC
      LIMIT 5
      `,
      [userId],
    );

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          points: user.points,
          level: user.level,
          created_at: user.created_at,
        },
        stats: {
          totalPoints: user.points,
          challengesSolved: Number(solvedRows[0]?.total || 0),
          labsCompleted: Number(labsCompletedRows[0]?.total || 0),
          globalRank: Number(rankRows[0]?.rank || 1),
          totalStudents: Number(totalStudentsRows[0]?.total || 1),
          level: user.level,
        },
        recentActivity: recentRows,
      },
    };
  }

  // ==========================================
  // GET USER PROGRESS (per lab)
  // GET /users/me/progress
  // ==========================================
  async getMyProgress(userId: number) {
    const labs = await this.databaseService.query(
      `
      SELECT
        l.id,
        l.title,
        l.description,
        l.category,
        l.difficulty,
        l.points,
        COUNT(c.id) AS total_challenges,
        COUNT(s.challenge_id) AS solved_challenges,
        CASE
          WHEN COUNT(c.id) = 0 THEN 0
          ELSE ROUND((COUNT(s.challenge_id) / COUNT(c.id)) * 100)
        END AS progress_pct
      FROM labs l
      LEFT JOIN challenges c ON c.lab_id = l.id AND c.is_active = 1
      LEFT JOIN (
        SELECT DISTINCT challenge_id FROM submissions WHERE user_id = ? AND is_correct = 1
      ) s ON s.challenge_id = c.id
      WHERE l.is_active = 1
      GROUP BY l.id, l.title, l.description, l.category, l.difficulty, l.points
      ORDER BY l.category, l.difficulty
      `,
      [userId],
    );

    return {
      success: true,
      data: labs,
    };
  }

  // ==========================================
  // UPDATE USER SETTINGS
  // PATCH /users/me
  // ==========================================
  async updateMe(
    userId: number,
    updates: {
      username?: string;
      currentPassword?: string;
      newPassword?: string;
    },
  ) {
    const userRows = await this.databaseService.query(
      `SELECT id, username, email, password_hash FROM users WHERE id = ? LIMIT 1`,
      [userId],
    );

    if (userRows.length === 0) {
      throw new NotFoundException('User not found');
    }

    const user = userRows[0];

    // Handle username change
    if (updates.username && updates.username.trim() !== user.username) {
      const cleanUsername = updates.username.trim();

      if (cleanUsername.length < 3) {
        throw new BadRequestException('Username must be at least 3 characters');
      }

      const existing = await this.databaseService.query(
        `SELECT id FROM users WHERE username = ? AND id != ? LIMIT 1`,
        [cleanUsername, userId],
      );

      if (existing.length > 0) {
        throw new ConflictException('Username is already taken');
      }

      await this.databaseService.query(
        `UPDATE users SET username = ? WHERE id = ?`,
        [cleanUsername, userId],
      );
    }

    // Handle password change
    if (updates.newPassword) {
      if (!updates.currentPassword) {
        throw new BadRequestException('Current password is required to change password');
      }

      const passwordValid = await bcrypt.compare(
        updates.currentPassword,
        user.password_hash,
      );

      if (!passwordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      if (updates.newPassword.length < 6) {
        throw new BadRequestException('New password must be at least 6 characters');
      }

      const newHash = await bcrypt.hash(updates.newPassword, 12);

      await this.databaseService.query(
        `UPDATE users SET password_hash = ? WHERE id = ?`,
        [newHash, userId],
      );
    }

    // Return updated user
    const updated = await this.findById(userId);
    return {
      success: true,
      message: 'Profile updated successfully',
      user: updated,
    };
  }

  // ==========================================
  // CREATE USER / REGISTER
  // POST /users
  // ==========================================
  async create(
    username: string,
    email: string,
    password: string,
  ) {
    // ------------------------------------------
    // CLEAN INPUT
    // ------------------------------------------

    const cleanUsername =
      username.trim();

    const cleanEmail =
      email.trim().toLowerCase();

    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (!cleanUsername) {
      throw new ConflictException(
        'Username is required',
      );
    }

    if (!cleanEmail) {
      throw new ConflictException(
        'Email is required',
      );
    }

    if (!password) {
      throw new ConflictException(
        'Password is required',
      );
    }

    // ------------------------------------------
    // CHECK USERNAME
    // ------------------------------------------

    const existingUsername =
      await this.databaseService.query(
        `
        SELECT id
        FROM users
        WHERE username = ?
        LIMIT 1
        `,
        [cleanUsername],
      );

    if (
      existingUsername.length > 0
    ) {
      throw new ConflictException(
        'Username is already taken',
      );
    }

    // ------------------------------------------
    // CHECK EMAIL
    // ------------------------------------------

    const existingEmail =
      await this.databaseService.query(
        `
        SELECT id
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [cleanEmail],
      );

    if (
      existingEmail.length > 0
    ) {
      throw new ConflictException(
        'Email is already registered',
      );
    }

    // ------------------------------------------
    // HASH PASSWORD
    // ------------------------------------------

    const passwordHash =
      await bcrypt.hash(
        password,
        12,
      );

    // ------------------------------------------
    // CREATE USER
    // ------------------------------------------

    const result =
      await this.databaseService.query(
        `
        INSERT INTO users
        (
          username,
          email,
          password_hash,
          role,
          points,
          level
        )
        VALUES
        (?, ?, ?, ?, ?, ?)
        `,
        [
          cleanUsername,
          cleanEmail,
          passwordHash,
          'STUDENT',
          0,
          1,
        ],
      );

    // ------------------------------------------
    // RETURN SAFE USER
    // ------------------------------------------

    return {
      success: true,

      message:
        'Account created successfully',

      user: {
        id: result.insertId,
        username: cleanUsername,
        email: cleanEmail,
        role: 'STUDENT',
        points: 0,
        level: 1,
      },
    };
  }

  // ==========================================
  // LOGIN
  // POST /users/login
  //
  // Username OR Email
  // ==========================================
  async login(
    usernameOrEmail: string,
    password: string,
  ) {
    // ------------------------------------------
    // CLEAN INPUT
    // ------------------------------------------

    const identifier =
      usernameOrEmail.trim();

    // ------------------------------------------
    // VALIDATE INPUT
    // ------------------------------------------

    if (!identifier) {
      throw new UnauthorizedException(
        'Username/email is required',
      );
    }

    if (!password) {
      throw new UnauthorizedException(
        'Password is required',
      );
    }

    // ------------------------------------------
    // FIND USER
    // ------------------------------------------

    const users =
      await this.databaseService.query(
        `
        SELECT
          id,
          username,
          email,
          password_hash,
          role,
          points,
          level,
          created_at
        FROM users
        WHERE username = ?
           OR email = ?
        LIMIT 1
        `,
        [
          identifier,
          identifier,
        ],
      );

    // ------------------------------------------
    // USER NOT FOUND
    // ------------------------------------------

    if (users.length === 0) {
      throw new UnauthorizedException(
        'Invalid username/email or password',
      );
    }

    const user = users[0];

    // ------------------------------------------
    // PASSWORD HASH CHECK
    // ------------------------------------------

    if (!user.password_hash) {
      throw new UnauthorizedException(
        'Invalid username/email or password',
      );
    }

    // ------------------------------------------
    // COMPARE PASSWORD
    // ------------------------------------------

    const passwordValid =
      await bcrypt.compare(
        password,
        user.password_hash,
      );

    if (!passwordValid) {
      throw new UnauthorizedException(
        'Invalid username/email or password',
      );
    }

    // ------------------------------------------
    // LOGIN SUCCESS
    // ------------------------------------------

    return {
      success: true,

      message:
        'Login successful',

      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        points: user.points,
        level: user.level,
        created_at:
          user.created_at,
      },
    };
  }
}