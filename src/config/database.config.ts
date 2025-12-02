import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DATABASE_HOST', 'localhost'),
  port: configService.get<number>('DATABASE_PORT', 8888),
  username: configService.get<string>('DATABASE_USERNAME', 'root'),
  password: configService.get<string>('DATABASE_PASSWORD', '1'),
  database: configService.get<string>('DATABASE_NAME', 'phuphiem_db'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: configService.get<string>('NODE_ENV') === 'development',
  autoLoadEntities: true,
});
