import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const secret =
      configService.get<string>('JWT_SECRET') ||
      process.env.JWT_SECRET ||
      'cyberlab-super-secret-key-change-this-in-production';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    if (!payload || (payload.sub === undefined && payload.id === undefined)) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const userId = payload.sub !== undefined ? payload.sub : payload.id;

    return {
      id: userId,
      userId: userId,
      sub: userId,
      username: payload.username,
      email: payload.email,
      role: payload.role,
    };
  }
}
