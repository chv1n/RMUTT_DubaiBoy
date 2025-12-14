import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1765617308580 implements MigrationInterface {
    name = 'InitialMigration1765617308580'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "BOM" ("id" SERIAL NOT NULL, "unit_id" integer NOT NULL, "product_id" integer NOT NULL, "material_id" integer NOT NULL, "usage_per_piece" numeric NOT NULL, "version" character varying NOT NULL, "active" boolean NOT NULL, "scrap_factor" numeric NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_BOM_PRODUCT_MATERIAL" UNIQUE ("product_id", "material_id"), CONSTRAINT "PK_d591514468036f985e63581fd18" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "inventory_transaction" ("inventory_transaction_id" SERIAL NOT NULL, "transaction_type" character varying NOT NULL, "transaction_date" TIMESTAMP NOT NULL, "quantity_change" integer NOT NULL, "reference_number" character varying NOT NULL, "reason_remarks" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "material_inventory_id" integer, "warehouse_id" integer, CONSTRAINT "PK_d0395146af0f78b83bf8979924a" PRIMARY KEY ("inventory_transaction_id"))`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" SERIAL NOT NULL, "user_id" integer, "username" character varying, "action" "public"."audit_logs_action_enum" NOT NULL, "entity_type" "public"."audit_logs_entity_type_enum" NOT NULL, "entity_id" character varying, "old_values" jsonb, "new_values" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
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
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TABLE "inventory_transaction"`);
        await queryRunner.query(`DROP TABLE "BOM"`);
    }

}
