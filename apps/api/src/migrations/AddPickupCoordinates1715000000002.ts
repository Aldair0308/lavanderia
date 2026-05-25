import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPickupCoordinates1715000000002 implements MigrationInterface {
  name = 'AddPickupCoordinates1715000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN "pickup_lat" decimal(10,7)`);
    await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN "pickup_lng" decimal(10,7)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "pickup_lng"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "pickup_lat"`);
  }
}
