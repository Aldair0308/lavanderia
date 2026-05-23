import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1630000000000 implements MigrationInterface {
  name = 'InitSchema1630000000000';

  public async up(_queryRunner: QueryRunner): Promise<void> {
    // TODO: Generate migration SQL based on entities.
    // Placeholder: create tables manually or use TypeORM CLI to generate.
    // For now, you may run `npm run migration:generate` after adjusting entities.
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // TODO: Drop tables if needed.
  }
}
