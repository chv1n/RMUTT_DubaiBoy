import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1765096251493 implements MigrationInterface {
    name = 'InitialMigration1765096251493'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "BOM" ADD "unit_id" integer`);
        await queryRunner.query(`ALTER TABLE "BOM" ADD CONSTRAINT "FK_36b5c6743551ac0e0731bc391f7" FOREIGN KEY ("unit_id") REFERENCES "material_units"("unit_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "BOM" DROP CONSTRAINT "FK_36b5c6743551ac0e0731bc391f7"`);
        await queryRunner.query(`ALTER TABLE "BOM" DROP COLUMN "unit_id"`);
    }

}
