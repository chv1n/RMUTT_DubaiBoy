import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBomUniqueConstraint1765514322920 implements MigrationInterface {
    name = 'AddBomUniqueConstraint1765514322920'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "BOM" ADD CONSTRAINT "UQ_BOM_PRODUCT_MATERIAL" UNIQUE ("product_id", "material_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "BOM" DROP CONSTRAINT "UQ_BOM_PRODUCT_MATERIAL"`);
    }

}
