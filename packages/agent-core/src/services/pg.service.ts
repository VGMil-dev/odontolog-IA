// @ts-nocheck
import { Pool } from 'pg';
import { env } from '../config/env.js';

export class PgService {
  public pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.PG_HOST || 'localhost',
      port: Number(process.env.PG_PORT) || 5432,
      user: process.env.PG_USER || 'odontocare',
      password: process.env.PG_PASSWORD || 'odontocare_secret_pass',
      database: process.env.PG_DB || 'odontocare_db',
    });
  }

  public async query(text: string, params?: any[]) {
    return this.pool.query(text, params);
  }
}

export const pgService = new PgService();
