import {
  Injectable,
  Logger,
  UnauthorizedException,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminLoginDto } from './dto/admin-login.dto';

const REFRESH_TOKEN_PREFIX = 'refresh_token';
const BCRYPT_SALT_ROUNDS = 10;

interface JwtPayload {
  sub: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService implements OnModuleDestroy {
  private readonly logger = new Logger(AuthService.name);
  private readonly redis: Redis;
  private readonly refreshSecret: string;
  private readonly refreshExpiration: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const redisUrl = this.configService.get<string>('redis.url', 'redis://localhost:6379');
    this.redis = new Redis(redisUrl);
    this.refreshSecret = this.configService.get<string>('jwt.refreshSecret') || 'fallback-refresh';
    this.refreshExpiration = this.configService.get<string>('jwt.refreshExpiration', '7d');
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  async adminLogin(dto: AdminLoginDto): Promise<TokenPair> {
    const { username, password } = dto;

    const defaultUsername = this.configService.get<string>('admin.defaultUsername');
    const defaultPassword = this.configService.get<string>('admin.defaultPassword');

    // Check if this is the default admin login (first-time setup)
    if (username === defaultUsername) {
      const existingAdmin = await this.prisma.user.findFirst({
        where: {
          username,
          role: { in: ['ADMIN', 'SUPER_ADMIN'] },
        },
      });

      if (!existingAdmin) {
        // First-time admin login: verify against config defaults and create admin user
        if (password !== defaultPassword) {
          throw new UnauthorizedException('Invalid credentials');
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

        const admin = await this.prisma.user.create({
          data: {
            username,
            telegramId: BigInt(0),
            role: 'SUPER_ADMIN',
            firstName: 'Admin',
            // Store hashed password in metadata or a dedicated field
            // Using a workaround since User model lacks password field
          },
        });

        // Store password hash in Redis for admin auth
        await this.redis.set(`admin_password:${admin.id}`, hashedPassword);

        const tokens = await this.generateTokens(admin);
        await this.storeRefreshToken(admin.id, tokens.refreshToken);

        this.logger.log(`Default admin account created and logged in: ${username}`);
        return tokens;
      }
    }

    // Standard admin login flow
    const user = await this.prisma.user.findFirst({
      where: {
        username,
        role: { in: ['ADMIN', 'SUPER_ADMIN'] },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Retrieve stored password hash from Redis
    const storedHash = await this.redis.get(`admin_password:${user.id}`);

    if (!storedHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, storedHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('Account is blocked');
    }

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    this.logger.log(`Admin logged in: ${username}`);
    return tokens;
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const userId = payload.sub;
    const storedToken = await this.redis.get(`${REFRESH_TOKEN_PREFIX}:${userId}`);

    if (!storedToken || storedToken !== refreshToken) {
      // Token reuse detected — invalidate all tokens for this user
      await this.redis.del(`${REFRESH_TOKEN_PREFIX}:${userId}`);
      this.logger.warn(`Refresh token reuse detected for user: ${userId}`);
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.isBlocked) {
      await this.redis.del(`${REFRESH_TOKEN_PREFIX}:${userId}`);
      throw new UnauthorizedException('User not found or blocked');
    }

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(userId, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.redis.del(`${REFRESH_TOKEN_PREFIX}:${userId}`);
    this.logger.log(`User logged out: ${userId}`);
  }

  async validateUser(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.isBlocked || user.deletedAt) {
      return null;
    }

    return {
      id: user.id,
      telegramId: user.telegramId.toString(),
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      balance: user.balance,
      language: user.language,
    };
  }

  async generateTokens(user: { id: string; role: string }): Promise<TokenPair> {
    const jwtPayload: JwtPayload = {
      sub: user.id,
      role: user.role,
    };

    const payload = { sub: jwtPayload.sub, role: jwtPayload.role } as Record<string, unknown>;
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.refreshSecret,
        expiresIn: this.refreshExpiration as unknown as number,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    const ttlSeconds = this.parseDurationToSeconds(this.refreshExpiration);
    await this.redis.set(
      `${REFRESH_TOKEN_PREFIX}:${userId}`,
      token,
      'EX',
      ttlSeconds,
    );
  }

  private parseDurationToSeconds(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);

    if (!match) {
      return 604800; // Default: 7 days
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const SECONDS_PER_MINUTE = 60;
    const SECONDS_PER_HOUR = 3600;
    const SECONDS_PER_DAY = 86400;

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * SECONDS_PER_MINUTE;
      case 'h':
        return value * SECONDS_PER_HOUR;
      case 'd':
        return value * SECONDS_PER_DAY;
      default:
        return SECONDS_PER_DAY * 7;
    }
  }
}
