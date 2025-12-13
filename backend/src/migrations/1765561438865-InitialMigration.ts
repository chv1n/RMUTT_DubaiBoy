import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1765561438865 implements MigrationInterface {
    name = 'InitialMigration1765561438865'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "material_inventory" DROP CONSTRAINT "FK_fbe7decb661fcc0199119ab5e2a"`);
        await queryRunner.query(`CREATE TABLE "plan_material_allocation" ("id" SERIAL NOT NULL, "plan_id" integer NOT NULL, "material_id" integer NOT NULL, "warehouse_id" integer NOT NULL, "inventory_id" integer NOT NULL, "allocated_quantity" numeric(15,3) NOT NULL, "used_quantity" numeric(15,3) NOT NULL DEFAULT '0', "returned_quantity" numeric(15,3) NOT NULL DEFAULT '0', "unit_cost" numeric(15,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fa733ce06103f985e5ec3d39001" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "BOM" ("id" SERIAL NOT NULL, "unit_id" integer NOT NULL, "product_id" integer NOT NULL, "material_id" integer NOT NULL, "usage_per_piece" numeric NOT NULL, "version" character varying NOT NULL, "active" boolean NOT NULL, "scrap_factor" numeric NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_BOM_PRODUCT_MATERIAL" UNIQUE ("product_id", "material_id"), CONSTRAINT "PK_d591514468036f985e63581fd18" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "inventory_transaction" ("inventory_transaction_id" SERIAL NOT NULL, "transaction_type" character varying NOT NULL, "transaction_date" TIMESTAMP NOT NULL, "quantity_change" integer NOT NULL, "reference_number" character varying NOT NULL, "reason_remarks" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "material_inventory_id" integer, "warehouse_id" integer, CONSTRAINT "PK_d0395146af0f78b83bf8979924a" PRIMARY KEY ("inventory_transaction_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'PASSWORD_CHANGE', 'PLAN_CONFIRMED', 'PLAN_STARTED', 'PLAN_COMPLETED', 'PLAN_CANCELLED', 'STOCK_RESERVED', 'STOCK_DEDUCTED', 'STOCK_RETURNED')`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_entity_type_enum" AS ENUM('MaterialMaster', 'Supplier', 'WarehouseMaster', 'User', 'Bom', 'ProductPlan', 'PlanList', 'Auth')`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" SERIAL NOT NULL, "user_id" integer, "username" character varying, "action" "public"."audit_logs_action_enum" NOT NULL, "entity_type" "public"."audit_logs_entity_type_enum" NOT NULL, "entity_id" character varying, "old_values" jsonb, "new_values" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "material_inventory" DROP CONSTRAINT "PK_9e7f9f28e869b0008ae532d936d"`);
        await queryRunner.query(`ALTER TABLE "material_inventory" DROP COLUMN "material_inventory_id"`);
        await queryRunner.query(`ALTER TABLE "material_inventory" DROP COLUMN "supplier_id"`);
        await queryRunner.query(`ALTER TABLE "product_plan" ADD "plan_status" character varying DEFAULT 'DRAFT'`);
        await queryRunner.query(`ALTER TABLE "product_plan" ADD "plan_priority" character varying DEFAULT 'LOW'`);
        await queryRunner.query(`ALTER TABLE "product_plan" ADD "actual_produced_quantity" integer`);
        await queryRunner.query(`ALTER TABLE "product_plan" ADD "estimated_cost" numeric(15,2)`);
        await queryRunner.query(`ALTER TABLE "product_plan" ADD "actual_cost" numeric(15,2)`);
        await queryRunner.query(`ALTER TABLE "product_plan" ADD "started_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "product_plan" ADD "completed_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "product_plan" ADD "cancelled_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "product_plan" ADD "cancel_reason" text`);
        await queryRunner.query(`ALTER TABLE "material_inventory" ADD "inventory_id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "material_inventory" ADD CONSTRAINT "PK_763fb5a7a4f9fca90c772a38f39" PRIMARY KEY ("inventory_id")`);
        await queryRunner.query(`ALTER TABLE "material_inventory" ADD "reserved_quantity" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "plan_material_allocation" ADD CONSTRAINT "FK_e2191631e598e3ab62ad1c51047" FOREIGN KEY ("plan_id") REFERENCES "product_plan"("plan_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plan_material_allocation" ADD CONSTRAINT "FK_e9129923334b95cadc40b42ab13" FOREIGN KEY ("material_id") REFERENCES "material_master"("material_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plan_material_allocation" ADD CONSTRAINT "FK_b2a765f8ef76f00988a6f5cb0f3" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse_master"("warehouse_master_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plan_material_allocation" ADD CONSTRAINT "FK_b6b93898e26f9bb48c0ad6ec8cf" FOREIGN KEY ("inventory_id") REFERENCES "material_inventory"("inventory_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "BOM" ADD CONSTRAINT "FK_8c727c3b5be8bccff0d5c24ed92" FOREIGN KEY ("product_id") REFERENCES "product"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "BOM" ADD CONSTRAINT "FK_bbd782cfa3abc9c61c1baa90282" FOREIGN KEY ("material_id") REFERENCES "material_master"("material_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "BOM" ADD CONSTRAINT "FK_36b5c6743551ac0e0731bc391f7" FOREIGN KEY ("unit_id") REFERENCES "material_units"("unit_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory_transaction" ADD CONSTRAINT "FK_a6c6cb8fbe4611c75a2e2f66dbe" FOREIGN KEY ("material_inventory_id") REFERENCES "material_inventory"("inventory_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory_transaction" ADD CONSTRAINT "FK_4f5bc0a6ce399297b7f14d1085b" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse_master"("warehouse_master_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inventory_transaction" DROP CONSTRAINT "FK_4f5bc0a6ce399297b7f14d1085b"`);
        await queryRunner.query(`ALTER TABLE "inventory_transaction" DROP CONSTRAINT "FK_a6c6cb8fbe4611c75a2e2f66dbe"`);
        await queryRunner.query(`ALTER TABLE "BOM" DROP CONSTRAINT "FK_36b5c6743551ac0e0731bc391f7"`);
        await queryRunner.query(`ALTER TABLE "BOM" DROP CONSTRAINT "FK_bbd782cfa3abc9c61c1baa90282"`);
        await queryRunner.query(`ALTER TABLE "BOM" DROP CONSTRAINT "FK_8c727c3b5be8bccff0d5c24ed92"`);
        await queryRunner.query(`ALTER TABLE "plan_material_allocation" DROP CONSTRAINT "FK_b6b93898e26f9bb48c0ad6ec8cf"`);
        await queryRunner.query(`ALTER TABLE "plan_material_allocation" DROP CONSTRAINT "FK_b2a765f8ef76f00988a6f5cb0f3"`);
        await queryRunner.query(`ALTER TABLE "plan_material_allocation" DROP CONSTRAINT "FK_e9129923334b95cadc40b42ab13"`);
        await queryRunner.query(`ALTER TABLE "plan_material_allocation" DROP CONSTRAINT "FK_e2191631e598e3ab62ad1c51047"`);
        await queryRunner.query(`ALTER TABLE "material_inventory" DROP COLUMN "reserved_quantity"`);
        await queryRunner.query(`ALTER TABLE "material_inventory" DROP CONSTRAINT "PK_763fb5a7a4f9fca90c772a38f39"`);
        await queryRunner.query(`ALTER TABLE "material_inventory" DROP COLUMN "inventory_id"`);
        await queryRunner.query(`ALTER TABLE "product_plan" DROP COLUMN "cancel_reason"`);
        await queryRunner.query(`ALTER TABLE "product_plan" DROP COLUMN "cancelled_at"`);
        await queryRunner.query(`ALTER TABLE "product_plan" DROP COLUMN "completed_at"`);
        await queryRunner.query(`ALTER TABLE "product_plan" DROP COLUMN "started_at"`);
        await queryRunner.query(`ALTER TABLE "product_plan" DROP COLUMN "actual_cost"`);
        await queryRunner.query(`ALTER TABLE "product_plan" DROP COLUMN "estimated_cost"`);
        await queryRunner.query(`ALTER TABLE "product_plan" DROP COLUMN "actual_produced_quantity"`);
        await queryRunner.query(`ALTER TABLE "product_plan" DROP COLUMN "plan_priority"`);
        await queryRunner.query(`ALTER TABLE "product_plan" DROP COLUMN "plan_status"`);
        await queryRunner.query(`ALTER TABLE "material_inventory" ADD "supplier_id" integer`);
        await queryRunner.query(`ALTER TABLE "material_inventory" ADD "material_inventory_id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "material_inventory" ADD CONSTRAINT "PK_9e7f9f28e869b0008ae532d936d" PRIMARY KEY ("material_inventory_id")`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_entity_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
        await queryRunner.query(`DROP TABLE "inventory_transaction"`);
        await queryRunner.query(`DROP TABLE "BOM"`);
        await queryRunner.query(`DROP TABLE "plan_material_allocation"`);
        await queryRunner.query(`ALTER TABLE "material_inventory" ADD CONSTRAINT "FK_fbe7decb661fcc0199119ab5e2a" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("supplier_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
