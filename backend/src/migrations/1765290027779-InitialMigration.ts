import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1765290027779 implements MigrationInterface {
    name = 'InitialMigration1765290027779'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "plan_list" DROP CONSTRAINT "FK_a19aa4eed614392494df08dda8e"`);
        await queryRunner.query(`ALTER TABLE "plan_list" ALTER COLUMN "plan_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_plan" DROP CONSTRAINT "FK_2efd8e57569a322903065256c8a"`);
        await queryRunner.query(`ALTER TABLE "product_plan" ALTER COLUMN "product_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "plan_list" ADD CONSTRAINT "FK_a19aa4eed614392494df08dda8e" FOREIGN KEY ("plan_id") REFERENCES "product_plan"("plan_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_plan" ADD CONSTRAINT "FK_2efd8e57569a322903065256c8a" FOREIGN KEY ("product_id") REFERENCES "product"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_plan" DROP CONSTRAINT "FK_2efd8e57569a322903065256c8a"`);
        await queryRunner.query(`ALTER TABLE "plan_list" DROP CONSTRAINT "FK_a19aa4eed614392494df08dda8e"`);
        await queryRunner.query(`ALTER TABLE "product_plan" ALTER COLUMN "product_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_plan" ADD CONSTRAINT "FK_2efd8e57569a322903065256c8a" FOREIGN KEY ("product_id") REFERENCES "product"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plan_list" ALTER COLUMN "plan_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "plan_list" ADD CONSTRAINT "FK_a19aa4eed614392494df08dda8e" FOREIGN KEY ("plan_id") REFERENCES "product_plan"("plan_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
