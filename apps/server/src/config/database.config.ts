import { registerAs } from '@nestjs/config';
import { SequelizeModuleOptions } from '@nestjs/sequelize';

export const databaseConfig = registerAs(
  'database',
  (): SequelizeModuleOptions => {
    const sslEnabled = process.env.DB_SSL === 'true';

    return {
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      schema: process.env.DB_SCHEMA,
      autoLoadModels: true,
      synchronize: false,
      logging: false,
      dialectOptions: sslEnabled
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : undefined,
    };
  },
);
