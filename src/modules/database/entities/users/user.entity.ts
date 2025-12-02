import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../base.entity';
import { UserDetail } from './user-detail.entity';
export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client',
}
@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  fullName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  phoneNumber: string;

  @OneToMany(() => UserDetail, (userDetail) => userDetail.user)
  userDetails: UserDetail[];

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CLIENT })
  role: UserRole;
}
