import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/User';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<{ token: string; user: Omit<User, 'password_hash'> }> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    const { password_hash, ...safeUser } = user;
    return { token, user: safeUser };
  }

  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) return null;
      const { password_hash, ...safeUser } = user;
      return safeUser;
    } catch {
      return null;
    }
  }

  async register(data: { email: string; password: string; name: string; role?: string }): Promise<User> {
    const existing = await this.userRepo.findOne({ where: { email: data.email } });
    if (existing) {
      throw new UnauthorizedException('El correo ya está registrado');
    }
    const password_hash = await bcrypt.hash(data.password, 10);
    const user = this.userRepo.create({
      email: data.email,
      password_hash,
      name: data.name,
      role: (data.role as any) || 'admin',
    });
    return this.userRepo.save(user);
  }
}
