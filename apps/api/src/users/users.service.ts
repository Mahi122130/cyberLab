import {
  ConflictException,
  Injectable,
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