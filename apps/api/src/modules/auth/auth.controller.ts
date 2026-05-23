import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { SupabaseAuthGuard } from './supabase-auth.guard';

@Controller('auth')
export class AuthController {
  // No direct use of AuthService in this placeholder controller

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  async getProfile(@Request() req: any) {
    // Return user profile from Supabase auth
    return req.user;
  }
}
