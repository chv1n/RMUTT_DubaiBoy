import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1764860195935 implements MigrationInterface {
    name = 'InitialMigration1764860195935'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "material_group" RENAME COLUMN "deleted_at" TO "delete_at"`);
        await queryRunner.query(`ALTER TABLE "material_container_type" DROP COLUMN "deleted_at"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "material_container_type" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "material_group" RENAME COLUMN "delete_at" TO "deleted_at"`);
    }

}
