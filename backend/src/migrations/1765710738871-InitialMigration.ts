import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1765710738871 implements MigrationInterface {
    name = 'InitialMigration1765710738871'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "material_group" ("group_id" SERIAL NOT NULL, "group_name" character varying NOT NULL, "abbreviation" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "create_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_984b144bf214f97d7f87f85acea" PRIMARY KEY ("group_id"))`);
        await queryRunner.query(`CREATE TABLE "material_container_type" ("type_id" SERIAL NOT NULL, "type_name" character varying NOT NULL, "create_at" TIMESTAMP NOT NULL DEFAULT now(), "is_active" boolean NOT NULL DEFAULT true, "deleted_at" TIMESTAMP, CONSTRAINT "PK_dc86a01d23358f54cbfcebea2da" PRIMARY KEY ("type_id"))`);
        await queryRunner.query(`CREATE TABLE "product_type" ("product_type_id" SERIAL NOT NULL, "type_name" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "create_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_c4498c5a83a077ffaf5ea1fb763" UNIQUE ("type_name"), CONSTRAINT "PK_a8166865294b0995e04f7fd7e12" PRIMARY KEY ("product_type_id"))`);
        await queryRunner.query(`CREATE TABLE "plan_material_allocation" ("id" SERIAL NOT NULL, "plan_id" integer NOT NULL, "material_id" integer NOT NULL, "warehouse_id" integer NOT NULL, "inventory_id" integer NOT NULL, "allocated_quantity" numeric(15,3) NOT NULL, "used_quantity" numeric(15,3) NOT NULL DEFAULT '0', "returned_quantity" numeric(15,3) NOT NULL DEFAULT '0', "unit_cost" numeric(15,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fa733ce06103f985e5ec3d39001" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_plan" ("plan_id" SERIAL NOT NULL, "product_id" integer NOT NULL, "input_quantity" integer, "plan_name" character varying, "plan_description" text, "start_date" date, "end_date" date, "plan_status" character varying DEFAULT 'DRAFT', "plan_priority" character varying DEFAULT 'LOW', "actual_produced_quantity" integer, "estimated_cost" numeric(15,2), "actual_cost" numeric(15,2), "started_at" TIMESTAMP, "completed_at" TIMESTAMP, "cancelled_at" TIMESTAMP, "cancel_reason" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_237d8dda86cbc9f429d2f460502" PRIMARY KEY ("plan_id"))`);
        await queryRunner.query(`CREATE TABLE "product" ("product_id" SERIAL NOT NULL, "product_name" character varying NOT NULL, "product_type_id" integer, "is_active" boolean DEFAULT true, "created_at" TIMESTAMP DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, "product_plan_id" integer, CONSTRAINT "UQ_aff16b2dbdb8fa56d29ed91e288" UNIQUE ("product_name"), CONSTRAINT "PK_1de6a4421ff0c410d75af27aeee" PRIMARY KEY ("product_id"))`);
        await queryRunner.query(`CREATE TABLE "BOM" ("id" SERIAL NOT NULL, "unit_id" integer NOT NULL, "product_id" integer NOT NULL, "material_id" integer NOT NULL, "usage_per_piece" numeric NOT NULL, "version" character varying NOT NULL, "active" boolean NOT NULL, "scrap_factor" numeric NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_BOM_PRODUCT_MATERIAL" UNIQUE ("product_id", "material_id"), CONSTRAINT "PK_d591514468036f985e63581fd18" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "material_units" ("unit_id" SERIAL NOT NULL, "unit_name" character varying NOT NULL, "create_at" TIMESTAMP NOT NULL DEFAULT now(), "is_active" boolean NOT NULL DEFAULT true, "deleted_at" TIMESTAMP, CONSTRAINT "PK_ed3790803d88eb7c2832b439342" PRIMARY KEY ("unit_id"))`);
        await queryRunner.query(`CREATE TABLE "supplier" ("supplier_id" SERIAL NOT NULL, "supplier_name" character varying, "phone" character varying, "email" character varying, "address" character varying, "is_active" boolean NOT NULL DEFAULT true, "update_date" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_e0f8ee60663218082b83251cd85" PRIMARY KEY ("supplier_id"))`);
        await queryRunner.query(`CREATE TABLE "material_master" ("material_id" SERIAL NOT NULL, "material_group_id" integer, "material_name" character varying NOT NULL, "order_leadtime" integer, "container_type_id" integer, "quantity_per_container" integer, "unit_id" integer, "container_min_stock" integer, "container_max_stock" integer, "lifetime" integer, "lifetime_unit" character varying, "is_active" boolean NOT NULL DEFAULT true, "update_date" TIMESTAMP NOT NULL DEFAULT now(), "cost_per_unit" double precision, "expiration_date" TIMESTAMP, "supplier_id" integer, "deleted_at" TIMESTAMP, CONSTRAINT "PK_13e253820dcf4731638381afcee" PRIMARY KEY ("material_id"))`);
        await queryRunner.query(`CREATE TABLE "material_inventory" ("inventory_id" SERIAL NOT NULL, "quantity" integer NOT NULL, "reserved_quantity" integer NOT NULL DEFAULT '0', "order_number" character varying, "mfg_date" TIMESTAMP, "exp_date" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "material_id" integer, "warehouse_id" integer, CONSTRAINT "PK_763fb5a7a4f9fca90c772a38f39" PRIMARY KEY ("inventory_id"))`);
        await queryRunner.query(`CREATE TABLE "inventory_transaction" ("inventory_transaction_id" SERIAL NOT NULL, "transaction_type" character varying NOT NULL, "transaction_date" TIMESTAMP NOT NULL, "quantity_change" integer NOT NULL, "reference_number" character varying NOT NULL, "reason_remarks" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "material_inventory_id" integer, "warehouse_id" integer, CONSTRAINT "PK_d0395146af0f78b83bf8979924a" PRIMARY KEY ("inventory_transaction_id"))`);
        await queryRunner.query(`CREATE TABLE "warehouse_master" ("warehouse_master_id" SERIAL NOT NULL, "warehouse_name" character varying, "warehouse_code" character varying, "warehouse_phone" character varying, "warehouse_address" character varying, "warehouse_email" character varying, "is_active" boolean DEFAULT true, "warehouse_deleted_at" TIMESTAMP, "warehouse_created_at" TIMESTAMP NOT NULL DEFAULT now(), "warehouse_updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8037096ecc1427b699a22b7b282" PRIMARY KEY ("warehouse_master_id"))`);
        await queryRunner.query(`CREATE TABLE "push_log" ("id" SERIAL NOT NULL, "subscription_id" integer NOT NULL, "user_id" integer, "title" character varying NOT NULL, "message" text NOT NULL, "payload_json" json, "status" character varying(20) NOT NULL, "error_message" text, "sent_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b559798a8c2869db3ff8846ccab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "push_subscription" ("id" SERIAL NOT NULL, "endpoint" character varying(255) NOT NULL, "user_id" integer NOT NULL, "p256dh" json NOT NULL, "auth" json NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_07fc861c0d2c38c1b830fb9cb5d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "username" character varying NOT NULL, "fullname" character varying NOT NULL, "password" text NOT NULL, "role" character varying NOT NULL DEFAULT 'user', "is_active" boolean NOT NULL DEFAULT true, "refresh_token" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" SERIAL NOT NULL, "user_id" integer, "username" character varying, "action" "public"."audit_logs_action_enum" NOT NULL, "entity_type" "public"."audit_logs_entity_type_enum" NOT NULL, "entity_id" character varying, "old_values" jsonb, "new_values" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "plan_material_allocation" ADD CONSTRAINT "FK_e2191631e598e3ab62ad1c51047" FOREIGN KEY ("plan_id") REFERENCES "product_plan"("plan_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plan_material_allocation" ADD CONSTRAINT "FK_e9129923334b95cadc40b42ab13" FOREIGN KEY ("material_id") REFERENCES "material_master"("material_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plan_material_allocation" ADD CONSTRAINT "FK_b2a765f8ef76f00988a6f5cb0f3" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse_master"("warehouse_master_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plan_material_allocation" ADD CONSTRAINT "FK_b6b93898e26f9bb48c0ad6ec8cf" FOREIGN KEY ("inventory_id") REFERENCES "material_inventory"("inventory_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_plan" ADD CONSTRAINT "FK_2efd8e57569a322903065256c8a" FOREIGN KEY ("product_id") REFERENCES "product"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_9c47355777d0ea7c76aa31059cd" FOREIGN KEY ("product_type_id") REFERENCES "product_type"("product_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_e8e1de0c5e78fbe123a773046ca" FOREIGN KEY ("product_plan_id") REFERENCES "product_plan"("plan_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "BOM" ADD CONSTRAINT "FK_8c727c3b5be8bccff0d5c24ed92" FOREIGN KEY ("product_id") REFERENCES "product"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "BOM" ADD CONSTRAINT "FK_bbd782cfa3abc9c61c1baa90282" FOREIGN KEY ("material_id") REFERENCES "material_master"("material_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "BOM" ADD CONSTRAINT "FK_36b5c6743551ac0e0731bc391f7" FOREIGN KEY ("unit_id") REFERENCES "material_units"("unit_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "material_master" ADD CONSTRAINT "FK_5fdef78ec3163f10348594ab750" FOREIGN KEY ("material_group_id") REFERENCES "material_group"("group_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "material_master" ADD CONSTRAINT "FK_be20a03591d6c48f1b526dcb065" FOREIGN KEY ("container_type_id") REFERENCES "material_container_type"("type_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "material_master" ADD CONSTRAINT "FK_402b7b3c7f0e26f40a679099f20" FOREIGN KEY ("unit_id") REFERENCES "material_units"("unit_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "material_master" ADD CONSTRAINT "FK_b066c6d73b86ccf7ae1c363a877" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("supplier_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "material_inventory" ADD CONSTRAINT "FK_196b19790f38a237240adb52959" FOREIGN KEY ("material_id") REFERENCES "material_master"("material_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "material_inventory" ADD CONSTRAINT "FK_d43eaf7ae8b14495c1e95ab5771" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse_master"("warehouse_master_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory_transaction" ADD CONSTRAINT "FK_a6c6cb8fbe4611c75a2e2f66dbe" FOREIGN KEY ("material_inventory_id") REFERENCES "material_inventory"("inventory_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory_transaction" ADD CONSTRAINT "FK_4f5bc0a6ce399297b7f14d1085b" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse_master"("warehouse_master_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "push_log" ADD CONSTRAINT "FK_e29938a9d50af45ef0ebb8a28d5" FOREIGN KEY ("subscription_id") REFERENCES "push_subscription"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "push_subscription" ADD CONSTRAINT "FK_ae9b58d71ea5fff546507fae207" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "push_subscription" DROP CONSTRAINT "FK_ae9b58d71ea5fff546507fae207"`);
        await queryRunner.query(`ALTER TABLE "push_log" DROP CONSTRAINT "FK_e29938a9d50af45ef0ebb8a28d5"`);
        await queryRunner.query(`ALTER TABLE "inventory_transaction" DROP CONSTRAINT "FK_4f5bc0a6ce399297b7f14d1085b"`);
        await queryRunner.query(`ALTER TABLE "inventory_transaction" DROP CONSTRAINT "FK_a6c6cb8fbe4611c75a2e2f66dbe"`);
        await queryRunner.query(`ALTER TABLE "material_inventory" DROP CONSTRAINT "FK_d43eaf7ae8b14495c1e95ab5771"`);
        await queryRunner.query(`ALTER TABLE "material_inventory" DROP CONSTRAINT "FK_196b19790f38a237240adb52959"`);
        await queryRunner.query(`ALTER TABLE "material_master" DROP CONSTRAINT "FK_b066c6d73b86ccf7ae1c363a877"`);
        await queryRunner.query(`ALTER TABLE "material_master" DROP CONSTRAINT "FK_402b7b3c7f0e26f40a679099f20"`);
        await queryRunner.query(`ALTER TABLE "material_master" DROP CONSTRAINT "FK_be20a03591d6c48f1b526dcb065"`);
        await queryRunner.query(`ALTER TABLE "material_master" DROP CONSTRAINT "FK_5fdef78ec3163f10348594ab750"`);
        await queryRunner.query(`ALTER TABLE "BOM" DROP CONSTRAINT "FK_36b5c6743551ac0e0731bc391f7"`);
        await queryRunner.query(`ALTER TABLE "BOM" DROP CONSTRAINT "FK_bbd782cfa3abc9c61c1baa90282"`);
        await queryRunner.query(`ALTER TABLE "BOM" DROP CONSTRAINT "FK_8c727c3b5be8bccff0d5c24ed92"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_e8e1de0c5e78fbe123a773046ca"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_9c47355777d0ea7c76aa31059cd"`);
        await queryRunner.query(`ALTER TABLE "product_plan" DROP CONSTRAINT "FK_2efd8e57569a322903065256c8a"`);
        await queryRunner.query(`ALTER TABLE "plan_material_allocation" DROP CONSTRAINT "FK_b6b93898e26f9bb48c0ad6ec8cf"`);
        await queryRunner.query(`ALTER TABLE "plan_material_allocation" DROP CONSTRAINT "FK_b2a765f8ef76f00988a6f5cb0f3"`);
        await queryRunner.query(`ALTER TABLE "plan_material_allocation" DROP CONSTRAINT "FK_e9129923334b95cadc40b42ab13"`);
        await queryRunner.query(`ALTER TABLE "plan_material_allocation" DROP CONSTRAINT "FK_e2191631e598e3ab62ad1c51047"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "push_subscription"`);
        await queryRunner.query(`DROP TABLE "push_log"`);
        await queryRunner.query(`DROP TABLE "warehouse_master"`);
        await queryRunner.query(`DROP TABLE "inventory_transaction"`);
        await queryRunner.query(`DROP TABLE "material_inventory"`);
        await queryRunner.query(`DROP TABLE "material_master"`);
        await queryRunner.query(`DROP TABLE "supplier"`);
        await queryRunner.query(`DROP TABLE "material_units"`);
        await queryRunner.query(`DROP TABLE "BOM"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TABLE "product_plan"`);
        await queryRunner.query(`DROP TABLE "plan_material_allocation"`);
        await queryRunner.query(`DROP TABLE "product_type"`);
        await queryRunner.query(`DROP TABLE "material_container_type"`);
        await queryRunner.query(`DROP TABLE "material_group"`);
    }

}
