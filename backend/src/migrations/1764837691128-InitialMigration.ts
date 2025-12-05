import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1764837691128 implements MigrationInterface {
    name = 'InitialMigration1764837691128'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "material_units" ("unit_id" SERIAL NOT NULL, "unit_name" character varying NOT NULL, "create_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_ed3790803d88eb7c2832b439342" PRIMARY KEY ("unit_id"))`);
        await queryRunner.query(`CREATE TABLE "supplier" ("supplier_id" SERIAL NOT NULL, "supplier_name" character varying, "phone" character varying, "email" character varying, "address" character varying, "active" integer NOT NULL DEFAULT '1', "update_date" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_e0f8ee60663218082b83251cd85" PRIMARY KEY ("supplier_id"))`);
        await queryRunner.query(`CREATE TABLE "material_group" ("group_id" SERIAL NOT NULL, "group_name" character varying NOT NULL, "abbreviation" character varying NOT NULL, "create_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_984b144bf214f97d7f87f85acea" PRIMARY KEY ("group_id"))`);
        await queryRunner.query(`CREATE TABLE "material_container_type" ("type_id" SERIAL NOT NULL, "type_name" character varying NOT NULL, "create_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_dc86a01d23358f54cbfcebea2da" PRIMARY KEY ("type_id"))`);
        await queryRunner.query(`CREATE TABLE "material_master" ("material_id" SERIAL NOT NULL, "material_group_id" integer, "material_name" character varying NOT NULL, "order_leadtime" integer, "container_type_id" integer, "quantity_per_container" integer, "unit_id" integer, "container_min_stock" integer, "container_max_stock" integer, "lifetime" integer, "lifetime_unit" character varying, "active" integer NOT NULL DEFAULT '1', "update_date" TIMESTAMP NOT NULL DEFAULT now(), "cost_per_unit" double precision, "expiration_date" TIMESTAMP, "supplier_id" integer, "deleted_at" TIMESTAMP, CONSTRAINT "PK_13e253820dcf4731638381afcee" PRIMARY KEY ("material_id"))`);
        await queryRunner.query(`ALTER TABLE "material_master" ADD CONSTRAINT "FK_5fdef78ec3163f10348594ab750" FOREIGN KEY ("material_group_id") REFERENCES "material_group"("group_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "material_master" ADD CONSTRAINT "FK_be20a03591d6c48f1b526dcb065" FOREIGN KEY ("container_type_id") REFERENCES "material_container_type"("type_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "material_master" ADD CONSTRAINT "FK_402b7b3c7f0e26f40a679099f20" FOREIGN KEY ("unit_id") REFERENCES "material_units"("unit_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "material_master" ADD CONSTRAINT "FK_b066c6d73b86ccf7ae1c363a877" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("supplier_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "material_master" DROP CONSTRAINT "FK_b066c6d73b86ccf7ae1c363a877"`);
        await queryRunner.query(`ALTER TABLE "material_master" DROP CONSTRAINT "FK_402b7b3c7f0e26f40a679099f20"`);
        await queryRunner.query(`ALTER TABLE "material_master" DROP CONSTRAINT "FK_be20a03591d6c48f1b526dcb065"`);
        await queryRunner.query(`ALTER TABLE "material_master" DROP CONSTRAINT "FK_5fdef78ec3163f10348594ab750"`);
        await queryRunner.query(`DROP TABLE "material_master"`);
        await queryRunner.query(`DROP TABLE "material_container_type"`);
        await queryRunner.query(`DROP TABLE "material_group"`);
        await queryRunner.query(`DROP TABLE "supplier"`);
        await queryRunner.query(`DROP TABLE "material_units"`);
    }

}
