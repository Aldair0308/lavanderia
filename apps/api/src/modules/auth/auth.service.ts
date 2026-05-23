import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private _supabase: SupabaseClient | null = null;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && serviceKey && serviceKey !== 'YOUR_SERVICE_ROLE_KEY') {
      this._supabase = createClient(url, serviceKey);
      this.logger.log('Supabase client initialized for auth');
    } else {
      this.logger.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured – auth will be disabled');
    }
  }

  async validateToken(token: string): Promise<any> {
    if (!this._supabase) {
      this.logger.warn('Auth disabled: skipping token validation');
      return null;
    }
    try {
      const { data, error } = await this._supabase.auth.getUser(token);
      if (error) {
        this.logger.warn('Supabase token validation error', error);
        return null;
      }
      return data?.user ?? null;
    } catch (e) {
      this.logger.error('Error during token validation', e);
      return null;
    }
  }
}
