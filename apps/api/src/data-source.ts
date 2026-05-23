import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';

// TODO: Load entities dynamically via autoLoadEntities won't work for CLI migrations
// We need to explicitly list all entities here for migration generation
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