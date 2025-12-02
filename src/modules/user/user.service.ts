import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../database/entities/users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUserDetails(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['userDetails'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
