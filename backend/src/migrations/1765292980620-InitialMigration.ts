import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1765292980620 implements MigrationInterface {
    name = 'InitialMigration1765292980620'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "BOM" DROP CONSTRAINT "FK_36b5c6743551ac0e0731bc391f7"`);
        await queryRunner.query(`ALTER TABLE "BOM" ALTER COLUMN "unit_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "BOM" ADD CONSTRAINT "FK_36b5c6743551ac0e0731bc391f7" FOREIGN KEY ("unit_id") REFERENCES "material_units"("unit_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "BOM" DROP CONSTRAINT "FK_36b5c6743551ac0e0731bc391f7"`);
        await queryRunner.query(`ALTER TABLE "BOM" ALTER COLUMN "unit_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "BOM" ADD CONSTRAINT "FK_36b5c6743551ac0e0731bc391f7" FOREIGN KEY ("unit_id") REFERENCES "material_units"("unit_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
