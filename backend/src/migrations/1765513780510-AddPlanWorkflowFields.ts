import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPlanWorkflowFields1765513780510 implements MigrationInterface {
    name = 'AddPlanWorkflowFields1765513780510'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "plan_material_allocation" ("id" SERIAL NOT NULL, "plan_id" integer NOT NULL, "material_id" integer NOT NULL, "warehouse_id" integer NOT NULL, "inventory_id" integer NOT NULL, "allocated_quantity" numeric(15,3) NOT NULL, "used_quantity" numeric(15,3) NOT NULL DEFAULT '0', "returned_quantity" numeric(15,3) NOT NULL DEFAULT '0', "unit_cost" numeric(15,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fa733ce06103f985e5ec3d39001" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product_plan" ADD "actual_produced_quantity" integer`);
        await queryRunner.query(`ALTER TABLE "product_plan" ADD "estimated_cost" numeric(15,2)`);
        await queryRunner.query(`ALTER TABLE "product_plan" ADD "actual_cost" numeric(15,2)`);
        await queryRunner.query(`ALTER TABLE "product_plan" ADD "started_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "product_plan" ADD "completed_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "product_plan" ADD "cancelled_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "product_plan" ADD "cancel_reason" text`);
        await queryRunner.query(`ALTER TABLE "material_inventory" ADD "reserved_quantity" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TYPE "public"."audit_logs_action_enum" RENAME TO "audit_logs_action_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'PASSWORD_CHANGE', 'PLAN_CONFIRMED', 'PLAN_STARTED', 'PLAN_COMPLETED', 'PLAN_CANCELLED', 'STOCK_RESERVED', 'STOCK_DEDUCTED', 'STOCK_RETURNED')`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ALTER COLUMN "action" TYPE "public"."audit_logs_action_enum" USING "action"::"text"::"public"."audit_logs_action_enum"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum_old"`);
        await queryRunner.query(`ALTER TABLE "plan_material_allocation" ADD CONSTRAINT "FK_e2191631e598e3ab62ad1c51047" FOREIGN KEY ("plan_id") REFERENCES "product_plan"("plan_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plan_material_allocation" ADD CONSTRAINT "FK_e9129923334b95cadc40b42ab13" FOREIGN KEY ("material_id") REFERENCES "material_master"("material_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plan_material_allocation" ADD CONSTRAINT "FK_b2a765f8ef76f00988a6f5cb0f3" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse_master"("warehouse_master_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plan_material_allocation" ADD CONSTRAINT "FK_b6b93898e26f9bb48c0ad6ec8cf" FOREIGN KEY ("inventory_id") REFERENCES "material_inventory"("inventory_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "plan_material_allocation" DROP CONSTRAINT "FK_b6b93898e26f9bb48c0ad6ec8cf"`);
        await queryRunner.query(`ALTER TABLE "plan_material_allocation" DROP CONSTRAINT "FK_b2a765f8ef76f00988a6f5cb0f3"`);
        await queryRunner.query(`ALTER TABLE "plan_material_allocation" DROP CONSTRAINT "FK_e9129923334b95cadc40b42ab13"`);
        await queryRunner.query(`ALTER TABLE "plan_material_allocation" DROP CONSTRAINT "FK_e2191631e598e3ab62ad1c51047"`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_action_enum_old" AS ENUM('CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'PASSWORD_CHANGE')`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ALTER COLUMN "action" TYPE "public"."audit_logs_action_enum_old" USING "action"::"text"::"public"."audit_logs_action_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."audit_logs_action_enum_old" RENAME TO "audit_logs_action_enum"`);
        await queryRunner.query(`ALTER TABLE "material_inventory" DROP COLUMN "reserved_quantity"`);
        await queryRunner.query(`ALTER TABLE "product_plan" DROP COLUMN "cancel_reason"`);
        await queryRunner.query(`ALTER TABLE "product_plan" DROP COLUMN "cancelled_at"`);
        await queryRunner.query(`ALTER TABLE "product_plan" DROP COLUMN "completed_at"`);
        await queryRunner.query(`ALTER TABLE "product_plan" DROP COLUMN "started_at"`);
        await queryRunner.query(`ALTER TABLE "product_plan" DROP COLUMN "actual_cost"`);
        await queryRunner.query(`ALTER TABLE "product_plan" DROP COLUMN "estimated_cost"`);
        await queryRunner.query(`ALTER TABLE "product_plan" DROP COLUMN "actual_produced_quantity"`);
        await queryRunner.query(`DROP TABLE "plan_material_allocation"`);
    }

}
