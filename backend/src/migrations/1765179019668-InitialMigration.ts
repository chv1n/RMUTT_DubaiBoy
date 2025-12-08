import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1765179019668 implements MigrationInterface {
    name = 'InitialMigration1765179019668'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "material_group" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "material_container_type" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "material_master" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "material_units" ADD "deleted_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "material_units" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "material_master" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "material_container_type" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "material_group" DROP COLUMN "deleted_at"`);
    }

}
