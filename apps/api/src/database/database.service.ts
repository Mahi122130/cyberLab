import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mysql, { Pool } from 'mysql2/promise';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor(private readonly configService: ConfigService) {
    this.pool = mysql.createPool({
      host: this.configService.get<string>('DB_HOST'),
      user: this.configService.get<string>('DB_USER'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_NAME'),
      port: Number(this.configService.get<string>('DB_PORT')),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  async query<T = any>(sql: string, params?: any[]): Promise<T> {
    const [rows] = await this.pool.query(sql, params);
    return rows as T;
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}