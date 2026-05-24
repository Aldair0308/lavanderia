import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1715000000000 implements MigrationInterface {
  name = 'InitSchema1715000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'operator')
    `);
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" varchar(255) NOT NULL,
        "password_hash" varchar(255) NOT NULL,
        "name" varchar(255) NOT NULL,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'admin',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "customers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "phone_whatsapp" varchar(20) NOT NULL,
        "address" text,
        "email" varchar(255),
        "tags" text NOT NULL DEFAULT '',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "last_order_at" TIMESTAMP,
        CONSTRAINT "UQ_customers_phone" UNIQUE ("phone_whatsapp"),
        CONSTRAINT "PK_customers" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."orders_status_enum" AS ENUM('PENDIENTE', 'RECOLECTANDO', 'EN_PROCESO', 'LISTO', 'COMPLETADO', 'CANCELADO')
    `);
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "customer_id" uuid NOT NULL,
        "status" "public"."orders_status_enum" NOT NULL,
        "service_type" varchar(255) NOT NULL,
        "quantity_kg" decimal,
        "notes" text,
        "pickup_address" text NOT NULL,
        "pickup_scheduled_at" TIMESTAMP,
        "delivered_at" TIMESTAMP,
        "total_price" decimal,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_orders" PRIMARY KEY ("id"),
        CONSTRAINT "FK_orders_customer" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "order_id" uuid NOT NULL,
        "item_type" varchar(255) NOT NULL,
        "quantity" integer NOT NULL,
        "price_per_unit" decimal NOT NULL,
        CONSTRAINT "PK_order_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_items_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."order_status_history_from_status_enum" AS ENUM('PENDIENTE', 'RECOLECTANDO', 'EN_PROCESO', 'LISTO', 'COMPLETADO', 'CANCELADO')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."order_status_history_to_status_enum" AS ENUM('PENDIENTE', 'RECOLECTANDO', 'EN_PROCESO', 'LISTO', 'COMPLETADO', 'CANCELADO')
    `);
    await queryRunner.query(`
      CREATE TABLE "order_status_history" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "order_id" uuid NOT NULL,
        "from_status" "public"."order_status_history_from_status_enum",
        "to_status" "public"."order_status_history_to_status_enum" NOT NULL,
        "changed_by" varchar(255) NOT NULL,
        "changed_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_order_status_history" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_status_history_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "whatsapp_conversations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "customer_id" uuid NOT NULL,
        "is_agent_active" boolean NOT NULL DEFAULT true,
        "needs_human" boolean NOT NULL DEFAULT false,
        "last_message_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_whatsapp_conversations" PRIMARY KEY ("id"),
        CONSTRAINT "FK_whatsapp_conversations_customer" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."whatsapp_messages_direction_enum" AS ENUM('inbound', 'outbound')
    `);
    await queryRunner.query(`
      CREATE TABLE "whatsapp_messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "conversation_id" uuid NOT NULL,
        "direction" "public"."whatsapp_messages_direction_enum" NOT NULL,
        "content" text NOT NULL,
        "is_automated" boolean NOT NULL DEFAULT false,
        "timestamp" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_whatsapp_messages" PRIMARY KEY ("id"),
        CONSTRAINT "FK_whatsapp_messages_conversation" FOREIGN KEY ("conversation_id") REFERENCES "whatsapp_conversations"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."campaigns_status_enum" AS ENUM('draft', 'scheduled', 'sending', 'sent')
    `);
    await queryRunner.query(`
      CREATE TABLE "campaigns" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "message_template" text NOT NULL,
        "target_segment" varchar(255) NOT NULL,
        "status" "public"."campaigns_status_enum" NOT NULL,
        "scheduled_at" TIMESTAMP,
        "sent_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_campaigns" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "campaign_recipients" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "campaign_id" uuid NOT NULL,
        "customer_id" uuid NOT NULL,
        "sent_at" TIMESTAMP,
        "response_received" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_campaign_recipients" PRIMARY KEY ("id"),
        CONSTRAINT "FK_campaign_recipients_campaign" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_campaign_recipients_customer" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "settings" (
        "key" varchar(255) NOT NULL,
        "value" text NOT NULL,
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_settings" PRIMARY KEY ("key")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "settings"`);
    await queryRunner.query(`DROP TABLE "campaign_recipients"`);
    await queryRunner.query(`DROP TABLE "campaigns"`);
    await queryRunner.query(`DROP TYPE "public"."campaigns_status_enum"`);
    await queryRunner.query(`DROP TABLE "whatsapp_messages"`);
    await queryRunner.query(`DROP TYPE "public"."whatsapp_messages_direction_enum"`);
    await queryRunner.query(`DROP TABLE "whatsapp_conversations"`);
    await queryRunner.query(`DROP TABLE "order_status_history"`);
    await queryRunner.query(`DROP TYPE "public"."order_status_history_to_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."order_status_history_from_status_enum"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
    await queryRunner.query(`DROP TABLE "customers"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
