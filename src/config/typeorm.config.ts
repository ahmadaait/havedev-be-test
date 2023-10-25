import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig({ path: '.env' });

const config = {
  type: 'mysql',
  host: `${process.env.DB_HOST}`,
  port: `${parseInt(process.env.DB_PORT)}`,
  username: `${process.env.DB_USER}`,
  password: `${process.env.DB_PASSWORD}`,
  database: `${process.env.DB_NAME}`,
  entities: [__dirname + '/../modules/**/entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: true,
};

export default registerAs('typeormconfig', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
