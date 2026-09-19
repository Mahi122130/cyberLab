import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    identifier: string,
    password: string,
  ) {
    // Find user by email or username
    const users = await this.databaseService.query(
      `
      SELECT
        id,
        username,
        email,
        password_hash,
        role,
        points,
        level
      FROM users
      WHERE email = ? OR username = ?
      LIMIT 1
      `,
      [identifier, identifier],
    );

    if (users.length === 0) {
      throw new UnauthorizedException(
        'Invalid email/username or password',
      );
    }

    const user = users[0];

    // Compare entered password with stored hash
    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password_hash,
      );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    // JWT payload
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    // Create JWT
    const accessToken =
      await this.jwtService.signAsync(payload);

    // Never return password_hash
    return {
      success: true,
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        points: user.points,
        level: user.level,
      },
    };
  }
}