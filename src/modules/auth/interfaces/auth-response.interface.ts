import { User } from '../../database/entities/users/user.entity';

export interface AuthResponse {
  accessToken: string;
  user: Pick<User, 'id' | 'email' | 'role' | 'fullName'>;
}
