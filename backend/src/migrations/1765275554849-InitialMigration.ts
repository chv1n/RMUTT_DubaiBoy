import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1765275554849 implements MigrationInterface {
    name = 'InitialMigration1765275554849'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "material_inventory" DROP CONSTRAINT "FK_196b19790f38a237240adb52959"`);
        await queryRunner.query(`ALTER TABLE "material_inventory" DROP CONSTRAINT "UQ_196b19790f38a237240adb52959"`);
        await queryRunner.query(`ALTER TABLE "material_inventory" DROP COLUMN "material_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "material_inventory" ADD "material_id" integer`);
        await queryRunner.query(`ALTER TABLE "material_inventory" ADD CONSTRAINT "UQ_196b19790f38a237240adb52959" UNIQUE ("material_id")`);
        await queryRunner.query(`ALTER TABLE "material_inventory" ADD CONSTRAINT "FK_196b19790f38a237240adb52959" FOREIGN KEY ("material_id") REFERENCES "material_master"("material_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
