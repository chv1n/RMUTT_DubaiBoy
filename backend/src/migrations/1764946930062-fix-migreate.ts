import { MigrationInterface, QueryRunner } from "typeorm";

export class FixMigreate1764946930062 implements MigrationInterface {
    name = 'FixMigreate1764946930062'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "create_date" TIMESTAMP DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "product-type" ADD "create_date" TIMESTAMP DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product-type" DROP COLUMN "create_date"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "create_date"`);
    }

}
