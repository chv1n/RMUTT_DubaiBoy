import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1765291875811 implements MigrationInterface {
    name = 'InitialMigration1765291875811'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_plan" DROP COLUMN "create_date"`);
        await queryRunner.query(`ALTER TABLE "product_plan" DROP COLUMN "update_date"`);
        await queryRunner.query(`ALTER TABLE "product_plan" DROP COLUMN "delete_date"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "active"`);
        await queryRunner.query(`ALTER TABLE "product_plan" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "product_plan" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "product_plan" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "users" ADD "deleted_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "product_plan" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "product_plan" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "product_plan" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "product_plan" ADD "delete_date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "product_plan" ADD "update_date" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "product_plan" ADD "create_date" TIMESTAMP NOT NULL DEFAULT now()`);
    }

}
