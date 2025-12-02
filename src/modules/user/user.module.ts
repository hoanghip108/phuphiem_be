import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/users/user.entity';
import { UserController } from './user.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  providers: [UserService],
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  controllers: [UserController],
})
export class UserModule {}
