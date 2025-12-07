import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1765093543112 implements MigrationInterface {
    name = 'InitialMigration1765093543112'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "material_units" RENAME COLUMN "deleted_at" TO "is_active"`);
        await queryRunner.query(`ALTER TABLE "material_group" RENAME COLUMN "delete_at" TO "is_active"`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "username" character varying NOT NULL, "fullname" character varying NOT NULL, "password" text NOT NULL, "role" character varying NOT NULL DEFAULT 'user', "active" boolean NOT NULL DEFAULT true, "refresh_token" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product" ("product_id" SERIAL NOT NULL, "product_name" character varying NOT NULL, "product_type_id" integer, "active" integer DEFAULT '1', "create_date" TIMESTAMP DEFAULT now(), "update_date" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_aff16b2dbdb8fa56d29ed91e288" UNIQUE ("product_name"), CONSTRAINT "PK_1de6a4421ff0c410d75af27aeee" PRIMARY KEY ("product_id"))`);
        await queryRunner.query(`CREATE TABLE "product-type" ("product_type_id" SERIAL NOT NULL, "type_name" character varying NOT NULL, "active" integer DEFAULT '1', "create_date" TIMESTAMP DEFAULT now(), "update_date" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_dc7fac945e1926ab2c4bf8a6cb3" UNIQUE ("type_name"), CONSTRAINT "PK_e7eae649e8dd6f3d171f245f135" PRIMARY KEY ("product_type_id"))`);
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "active"`);
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "material_master" DROP COLUMN "active"`);
        await queryRunner.query(`ALTER TABLE "material_master" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "material_container_type" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "material_master" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "material_units" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "material_units" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "material_group" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "material_group" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_9c47355777d0ea7c76aa31059cd" FOREIGN KEY ("product_type_id") REFERENCES "product-type"("product_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_9c47355777d0ea7c76aa31059cd"`);
        await queryRunner.query(`ALTER TABLE "material_group" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "material_group" ADD "is_active" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "material_units" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "material_units" ADD "is_active" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "material_master" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "material_container_type" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "material_master" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "material_master" ADD "active" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD "active" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`DROP TABLE "product-type"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`ALTER TABLE "material_group" RENAME COLUMN "is_active" TO "delete_at"`);
        await queryRunner.query(`ALTER TABLE "material_units" RENAME COLUMN "is_active" TO "deleted_at"`);
    }

}
