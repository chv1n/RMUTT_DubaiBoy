import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1765180010266 implements MigrationInterface {
    name = 'InitialMigration1765180010266'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "warehouse_master" DROP COLUMN "warehouse_number"`);
        await queryRunner.query(`ALTER TABLE "warehouse_master" ADD "warehouse_number" boolean DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "warehouse_master" DROP COLUMN "warehouse_number"`);
        await queryRunner.query(`ALTER TABLE "warehouse_master" ADD "warehouse_number" integer DEFAULT '1'`);
    }

}
