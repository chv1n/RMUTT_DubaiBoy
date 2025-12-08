import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1765207239673 implements MigrationInterface {
    name = 'InitialMigration1765207239673'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_9c47355777d0ea7c76aa31059cd"`);
        await queryRunner.query(`CREATE TABLE "product_type" ("product_type_id" SERIAL NOT NULL, "type_name" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "create_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_c4498c5a83a077ffaf5ea1fb763" UNIQUE ("type_name"), CONSTRAINT "PK_a8166865294b0995e04f7fd7e12" PRIMARY KEY ("product_type_id"))`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "active"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "update_date"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "create_date"`);
        await queryRunner.query(`ALTER TABLE "material_group" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "material_container_type" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "product" ADD "is_active" boolean DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "product" ADD "created_at" TIMESTAMP DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "product" ADD "updated_at" TIMESTAMP DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "material_units" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "material_master" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "warehouse_master" ALTER COLUMN "warehouse_number" SET DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_9c47355777d0ea7c76aa31059cd" FOREIGN KEY ("product_type_id") REFERENCES "product_type"("product_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_9c47355777d0ea7c76aa31059cd"`);
        await queryRunner.query(`ALTER TABLE "warehouse_master" ALTER COLUMN "warehouse_number" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "material_master" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "material_units" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "material_container_type" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "material_group" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "create_date" TIMESTAMP DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "product" ADD "update_date" TIMESTAMP DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "product" ADD "active" integer DEFAULT '1'`);
        await queryRunner.query(`DROP TABLE "product_type"`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_9c47355777d0ea7c76aa31059cd" FOREIGN KEY ("product_type_id") REFERENCES "product-type"("product_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
