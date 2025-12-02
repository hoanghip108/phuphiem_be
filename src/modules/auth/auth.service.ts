import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User, UserRole } from '../database/entities/users/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDto, RegisterDto } from './dtos';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { AuthResponse } from './interfaces/auth-response.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const existedUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existedUser) {
      throw new BadRequestException('User already exists');
    }
    const hashedPassword = await argon2.hash(registerDto.password);
    const userDetails =
      registerDto.province ||
      registerDto.district ||
      registerDto.ward ||
      registerDto.address
        ? [
            {
              phoneNumber: registerDto.phoneNumber,
              province: registerDto.province,
              district: registerDto.district,
              ward: registerDto.ward,
              address: registerDto.address,
            },
          ]
        : [];
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      role: UserRole.CLIENT,
      userDetails,
    });
    return this.userRepository.save(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepository.findOne({
      select: ['id', 'email', 'password', 'role', 'fullName'],
      where: { email: loginDto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await argon2.verify(
      user.password,
      loginDto.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const secret = this.configService.get<string>('JWT_SECRET', 'secret');
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') ?? '1h';
    const accessToken = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn: expiresIn as JwtSignOptions['expiresIn'],
    });
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
      accessToken,
    };
  }
}
