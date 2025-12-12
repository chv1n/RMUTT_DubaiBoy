import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1765463146550 implements MigrationInterface {
    name = 'InitialMigration1765463146550'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // เพิ่ม columns ใหม่ใน product_plan
        await queryRunner.query(`ALTER TABLE "product_plan" ADD "plan_status" character varying DEFAULT 'PENDING'`);
        await queryRunner.query(`ALTER TABLE "product_plan" ADD "plan_priority" character varying DEFAULT 'LOW'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_plan" DROP COLUMN "plan_priority"`);
        await queryRunner.query(`ALTER TABLE "product_plan" DROP COLUMN "plan_status"`);
    }

}
