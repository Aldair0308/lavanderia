import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixColumnNames1715000000001 implements MigrationInterface {
  name = 'FixColumnNames1715000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" RENAME COLUMN "customer_id" TO "customerId"`).catch(() => {});
    await queryRunner.query(`ALTER TABLE "order_items" RENAME COLUMN "order_id" TO "orderId"`).catch(() => {});
    await queryRunner.query(`ALTER TABLE "order_status_history" RENAME COLUMN "order_id" TO "orderId"`).catch(() => {});
    await queryRunner.query(`ALTER TABLE "whatsapp_conversations" RENAME COLUMN "customer_id" TO "customerId"`).catch(() => {});
    await queryRunner.query(`ALTER TABLE "whatsapp_messages" RENAME COLUMN "conversation_id" TO "conversationId"`).catch(() => {});
    await queryRunner.query(`ALTER TABLE "campaign_recipients" RENAME COLUMN "campaign_id" TO "campaignId"`).catch(() => {});
    await queryRunner.query(`ALTER TABLE "campaign_recipients" RENAME COLUMN "customer_id" TO "customerId"`).catch(() => {});
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "campaign_recipients" RENAME COLUMN "customerId" TO "customer_id"`).catch(() => {});
    await queryRunner.query(`ALTER TABLE "campaign_recipients" RENAME COLUMN "campaignId" TO "campaign_id"`).catch(() => {});
    await queryRunner.query(`ALTER TABLE "whatsapp_messages" RENAME COLUMN "conversationId" TO "conversation_id"`).catch(() => {});
    await queryRunner.query(`ALTER TABLE "whatsapp_conversations" RENAME COLUMN "customerId" TO "customer_id"`).catch(() => {});
    await queryRunner.query(`ALTER TABLE "order_status_history" RENAME COLUMN "orderId" TO "order_id"`).catch(() => {});
    await queryRunner.query(`ALTER TABLE "order_items" RENAME COLUMN "orderId" TO "order_id"`).catch(() => {});
    await queryRunner.query(`ALTER TABLE "orders" RENAME COLUMN "customerId" TO "customer_id"`).catch(() => {});
  }
}
