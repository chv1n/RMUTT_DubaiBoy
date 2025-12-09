import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1765288593042 implements MigrationInterface {
    name = 'InitialMigration1765288593042'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."plan_list_priority_enum" AS ENUM('HIGH', 'MEDIUM', 'LOW')`);
        await queryRunner.query(`CREATE TYPE "public"."plan_list_status_enum" AS ENUM('HIGH', 'MEDIUM', 'LOW')`);
        await queryRunner.query(`CREATE TABLE "plan_list" ("plan_list_id" SERIAL NOT NULL, "priority" "public"."plan_list_priority_enum", "status" "public"."plan_list_status_enum", "plan_id" integer, CONSTRAINT "PK_5d5018c3a8122a6ed303850e416" PRIMARY KEY ("plan_list_id"))`);
        await queryRunner.query(`CREATE TABLE "product_plan" ("plan_id" SERIAL NOT NULL, "input_quantity" integer, "plan_name" character varying, "plan_description" text, "start_date" date, "end_date" date, "create_date" TIMESTAMP NOT NULL DEFAULT now(), "update_date" TIMESTAMP NOT NULL DEFAULT now(), "delete_date" TIMESTAMP, "product_id" integer, CONSTRAINT "PK_237d8dda86cbc9f429d2f460502" PRIMARY KEY ("plan_id"))`);
        await queryRunner.query(`ALTER TABLE "warehouse_master" DROP COLUMN "warehouse_number"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "product_plan_id" integer`);
        await queryRunner.query(`ALTER TABLE "warehouse_master" ADD "warehouse_email" character varying`);
        await queryRunner.query(`ALTER TABLE "warehouse_master" ADD "is_active" boolean DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "users" ADD "active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "plan_list" ADD CONSTRAINT "FK_a19aa4eed614392494df08dda8e" FOREIGN KEY ("plan_id") REFERENCES "product_plan"("plan_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_plan" ADD CONSTRAINT "FK_2efd8e57569a322903065256c8a" FOREIGN KEY ("product_id") REFERENCES "product"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_e8e1de0c5e78fbe123a773046ca" FOREIGN KEY ("product_plan_id") REFERENCES "product_plan"("plan_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_e8e1de0c5e78fbe123a773046ca"`);
        await queryRunner.query(`ALTER TABLE "product_plan" DROP CONSTRAINT "FK_2efd8e57569a322903065256c8a"`);
        await queryRunner.query(`ALTER TABLE "plan_list" DROP CONSTRAINT "FK_a19aa4eed614392494df08dda8e"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "active"`);
        await queryRunner.query(`ALTER TABLE "warehouse_master" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "warehouse_master" DROP COLUMN "warehouse_email"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "product_plan_id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "warehouse_master" ADD "warehouse_number" boolean DEFAULT true`);
        await queryRunner.query(`DROP TABLE "product_plan"`);
        await queryRunner.query(`DROP TABLE "plan_list"`);
        await queryRunner.query(`DROP TYPE "public"."plan_list_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."plan_list_priority_enum"`);
    }

}
