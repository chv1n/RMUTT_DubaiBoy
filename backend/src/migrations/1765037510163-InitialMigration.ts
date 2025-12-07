import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1765037510163 implements MigrationInterface {
    name = 'InitialMigration1765037510163'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "BOM" ("id" SERIAL NOT NULL, "product_id" integer NOT NULL, "material_id" integer NOT NULL, "usage_per_piece" numeric NOT NULL, "version" character varying NOT NULL, "active" boolean NOT NULL, "scrap_factor" numeric NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_d591514468036f985e63581fd18" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "BOM" ADD CONSTRAINT "FK_8c727c3b5be8bccff0d5c24ed92" FOREIGN KEY ("product_id") REFERENCES "product"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "BOM" ADD CONSTRAINT "FK_bbd782cfa3abc9c61c1baa90282" FOREIGN KEY ("material_id") REFERENCES "material_master"("material_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "BOM" DROP CONSTRAINT "FK_bbd782cfa3abc9c61c1baa90282"`);
        await queryRunner.query(`ALTER TABLE "BOM" DROP CONSTRAINT "FK_8c727c3b5be8bccff0d5c24ed92"`);
        await queryRunner.query(`DROP TABLE "BOM"`);
    }

}
