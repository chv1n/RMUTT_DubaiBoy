import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1765126916826 implements MigrationInterface {
    name = 'InitialMigration1765126916826'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "material_group" RENAME COLUMN "delete_at" TO "is_active"`);
        await queryRunner.query(`ALTER TABLE "material_units" RENAME COLUMN "deleted_at" TO "is_active"`);
        await queryRunner.query(`CREATE TABLE "material_inventory" ("material_inventory_id" SERIAL NOT NULL, "quantity" integer NOT NULL, "order_number" character varying NOT NULL, "mfg_date" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "material_id" integer, "warehouse_id" integer, "supplier_id" integer, CONSTRAINT "PK_9e7f9f28e869b0008ae532d936d" PRIMARY KEY ("material_inventory_id"))`);
        await queryRunner.query(`CREATE TABLE "inventory_transaction" ("inventory_transaction_id" SERIAL NOT NULL, "transaction_type" character varying NOT NULL, "transaction_date" TIMESTAMP NOT NULL, "quantity_change" integer NOT NULL, "reference_number" character varying NOT NULL, "reason_remarks" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "material_inventory_id" integer, "warehouse_id" integer, CONSTRAINT "PK_d0395146af0f78b83bf8979924a" PRIMARY KEY ("inventory_transaction_id"))`);
        await queryRunner.query(`CREATE TABLE "warehouse_master" ("warehouse_master_id" SERIAL NOT NULL, "warehouse_name" character varying, "warehouse_code" character varying, "warehouse_phone" character varying, "warehouse_address" character varying, "warehouse_number" integer, "warehouse_deleted_at" TIMESTAMP, "warehouse_created_at" TIMESTAMP NOT NULL DEFAULT now(), "warehouse_updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8037096ecc1427b699a22b7b282" PRIMARY KEY ("warehouse_master_id"))`);
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "active"`);
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "material_master" DROP COLUMN "active"`);
        await queryRunner.query(`ALTER TABLE "material_master" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "material_container_type" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "material_master" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "material_group" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "material_group" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "material_units" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "material_units" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "material_inventory" ADD CONSTRAINT "FK_196b19790f38a237240adb52959" FOREIGN KEY ("material_id") REFERENCES "material_master"("material_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "material_inventory" ADD CONSTRAINT "FK_d43eaf7ae8b14495c1e95ab5771" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse_master"("warehouse_master_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "material_inventory" ADD CONSTRAINT "FK_fbe7decb661fcc0199119ab5e2a" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("supplier_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory_transaction" ADD CONSTRAINT "FK_a6c6cb8fbe4611c75a2e2f66dbe" FOREIGN KEY ("material_inventory_id") REFERENCES "material_inventory"("material_inventory_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory_transaction" ADD CONSTRAINT "FK_4f5bc0a6ce399297b7f14d1085b" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse_master"("warehouse_master_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inventory_transaction" DROP CONSTRAINT "FK_4f5bc0a6ce399297b7f14d1085b"`);
        await queryRunner.query(`ALTER TABLE "inventory_transaction" DROP CONSTRAINT "FK_a6c6cb8fbe4611c75a2e2f66dbe"`);
        await queryRunner.query(`ALTER TABLE "material_inventory" DROP CONSTRAINT "FK_fbe7decb661fcc0199119ab5e2a"`);
        await queryRunner.query(`ALTER TABLE "material_inventory" DROP CONSTRAINT "FK_d43eaf7ae8b14495c1e95ab5771"`);
        await queryRunner.query(`ALTER TABLE "material_inventory" DROP CONSTRAINT "FK_196b19790f38a237240adb52959"`);
        await queryRunner.query(`ALTER TABLE "material_units" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "material_units" ADD "is_active" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "material_group" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "material_group" ADD "is_active" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "material_master" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "material_container_type" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "material_master" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "material_master" ADD "active" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD "active" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`DROP TABLE "warehouse_master"`);
        await queryRunner.query(`DROP TABLE "inventory_transaction"`);
        await queryRunner.query(`DROP TABLE "material_inventory"`);
        await queryRunner.query(`ALTER TABLE "material_units" RENAME COLUMN "is_active" TO "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "material_group" RENAME COLUMN "is_active" TO "delete_at"`);
    }

}
