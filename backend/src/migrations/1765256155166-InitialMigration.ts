import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1765256155166 implements MigrationInterface {
    name = 'InitialMigration1765256155166'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "warehouse_master" ALTER COLUMN "warehouse_number" SET DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "warehouse_master" ALTER COLUMN "warehouse_number" SET DEFAULT true`);
    }

}
