import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1765439692094 implements MigrationInterface {
    name = 'InitialMigration1765439692094'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_9c47355777d0ea7c76aa31059cd"`);
        await queryRunner.query(`CREATE TABLE "product_type" ("product_type_id" SERIAL NOT NULL, "type_name" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "create_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_c4498c5a83a077ffaf5ea1fb763" UNIQUE ("type_name"), CONSTRAINT "PK_a8166865294b0995e04f7fd7e12" PRIMARY KEY ("product_type_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."plan_list_priority_enum" AS ENUM('HIGH', 'MEDIUM', 'LOW')`);
        await queryRunner.query(`CREATE TYPE "public"."plan_list_status_enum" AS ENUM('PROCESSING', 'COMPLETED', 'CANCELLED', 'PENDING')`);
        await queryRunner.query(`CREATE TABLE "plan_list" ("plan_list_id" SERIAL NOT NULL, "plan_id" integer NOT NULL, "priority" "public"."plan_list_priority_enum", "status" "public"."plan_list_status_enum", "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_5d5018c3a8122a6ed303850e416" PRIMARY KEY ("plan_list_id"))`);
        await queryRunner.query(`CREATE TABLE "product_plan" ("plan_id" SERIAL NOT NULL, "product_id" integer NOT NULL, "input_quantity" integer, "plan_name" character varying, "plan_description" text, "start_date" date, "end_date" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_237d8dda86cbc9f429d2f460502" PRIMARY KEY ("plan_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'PASSWORD_CHANGE')`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_entity_type_enum" AS ENUM('MaterialMaster', 'Supplier', 'WarehouseMaster', 'User', 'Bom', 'ProductPlan', 'PlanList', 'Auth')`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" SERIAL NOT NULL, "user_id" integer, "username" character varying, "action" "public"."audit_logs_action_enum" NOT NULL, "entity_type" "public"."audit_logs_entity_type_enum" NOT NULL, "entity_id" character varying, "old_values" jsonb, "new_values" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "active"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "create_date"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "update_date"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "active"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "is_active" boolean DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "product" ADD "created_at" TIMESTAMP DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "product" ADD "updated_at" TIMESTAMP DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "product" ADD "product_plan_id" integer`);
        await queryRunner.query(`ALTER TABLE "users" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "users" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "BOM" DROP CONSTRAINT "FK_36b5c6743551ac0e0731bc391f7"`);
        await queryRunner.query(`ALTER TABLE "BOM" ALTER COLUMN "unit_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "plan_list" ADD CONSTRAINT "FK_a19aa4eed614392494df08dda8e" FOREIGN KEY ("plan_id") REFERENCES "product_plan"("plan_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_plan" ADD CONSTRAINT "FK_2efd8e57569a322903065256c8a" FOREIGN KEY ("product_id") REFERENCES "product"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Insert existing product_type_ids from product table into product_type before adding FK constraint
        await queryRunner.query(`
            INSERT INTO "product_type" ("product_type_id", "type_name")
            SELECT DISTINCT p.product_type_id, 'Type ' || p.product_type_id
            FROM "product" p
            WHERE p.product_type_id IS NOT NULL
            AND NOT EXISTS (SELECT 1 FROM "product_type" pt WHERE pt.product_type_id = p.product_type_id)
        `);
        // Reset sequence to max id
        await queryRunner.query(`SELECT setval('product_type_product_type_id_seq', COALESCE((SELECT MAX(product_type_id) FROM product_type), 1), true)`);

        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_9c47355777d0ea7c76aa31059cd" FOREIGN KEY ("product_type_id") REFERENCES "product_type"("product_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_e8e1de0c5e78fbe123a773046ca" FOREIGN KEY ("product_plan_id") REFERENCES "product_plan"("plan_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "BOM" ADD CONSTRAINT "FK_36b5c6743551ac0e0731bc391f7" FOREIGN KEY ("unit_id") REFERENCES "material_units"("unit_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "BOM" DROP CONSTRAINT "FK_36b5c6743551ac0e0731bc391f7"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_e8e1de0c5e78fbe123a773046ca"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_9c47355777d0ea7c76aa31059cd"`);
        await queryRunner.query(`ALTER TABLE "product_plan" DROP CONSTRAINT "FK_2efd8e57569a322903065256c8a"`);
        await queryRunner.query(`ALTER TABLE "plan_list" DROP CONSTRAINT "FK_a19aa4eed614392494df08dda8e"`);
        await queryRunner.query(`ALTER TABLE "BOM" ALTER COLUMN "unit_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "BOM" ADD CONSTRAINT "FK_36b5c6743551ac0e0731bc391f7" FOREIGN KEY ("unit_id") REFERENCES "material_units"("unit_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "product_plan_id"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "product" ADD "update_date" TIMESTAMP DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "product" ADD "create_date" TIMESTAMP DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "product" ADD "active" integer DEFAULT '1'`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_entity_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
        await queryRunner.query(`DROP TABLE "product_plan"`);
        await queryRunner.query(`DROP TABLE "plan_list"`);
        await queryRunner.query(`DROP TYPE "public"."plan_list_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."plan_list_priority_enum"`);
        await queryRunner.query(`DROP TABLE "product_type"`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_9c47355777d0ea7c76aa31059cd" FOREIGN KEY ("product_type_id") REFERENCES "product-type"("product_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
