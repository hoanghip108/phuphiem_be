import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../base.entity';
import { User } from './user.entity';

@Entity('user_details')
export class UserDetail extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  province: string;

  @Column({ type: 'varchar', length: 255 })
  district: string;

  @Column({ type: 'varchar', length: 255 })
  ward: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.id)
  user: User;
}
