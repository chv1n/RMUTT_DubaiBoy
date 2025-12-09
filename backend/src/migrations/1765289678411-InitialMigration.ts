import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1765289678411 implements MigrationInterface {
    name = 'InitialMigration1765289678411'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "plan_list" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "plan_list" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "plan_list" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TYPE "public"."plan_list_status_enum" RENAME TO "plan_list_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."plan_list_status_enum" AS ENUM('PROCESSING', 'COMPLETED', 'CANCELLED', 'PENDING')`);
        await queryRunner.query(`ALTER TABLE "plan_list" ALTER COLUMN "status" TYPE "public"."plan_list_status_enum" USING "status"::"text"::"public"."plan_list_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."plan_list_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."plan_list_status_enum_old" AS ENUM('HIGH', 'MEDIUM', 'LOW')`);
        await queryRunner.query(`ALTER TABLE "plan_list" ALTER COLUMN "status" TYPE "public"."plan_list_status_enum_old" USING "status"::"text"::"public"."plan_list_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."plan_list_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."plan_list_status_enum_old" RENAME TO "plan_list_status_enum"`);
        await queryRunner.query(`ALTER TABLE "plan_list" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "plan_list" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "plan_list" DROP COLUMN "created_at"`);
    }

}
