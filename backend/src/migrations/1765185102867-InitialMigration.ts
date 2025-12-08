import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1765185102867 implements MigrationInterface {
    name = 'InitialMigration1765185102867'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "material_inventory" ADD "exp_date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "warehouse_master" ALTER COLUMN "warehouse_number" SET DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "material_inventory" ALTER COLUMN "order_number" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "material_inventory" ALTER COLUMN "mfg_date" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "material_inventory" ALTER COLUMN "mfg_date" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "material_inventory" ALTER COLUMN "order_number" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "warehouse_master" ALTER COLUMN "warehouse_number" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "material_inventory" DROP COLUMN "exp_date"`);
    }

}
