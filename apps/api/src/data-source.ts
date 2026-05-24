import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';
import * as dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

const entitiesPath = path.join(__dirname, '**', '*.entity{.ts,.js}');

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/lavanderia',
  entities: [entitiesPath],
  migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;