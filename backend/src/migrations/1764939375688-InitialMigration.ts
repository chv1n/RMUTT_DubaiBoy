import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1764939375688 implements MigrationInterface {
    name = 'InitialMigration1764939375688'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product" ("product_id" SERIAL NOT NULL, "product_name" character varying, "product_type_id" integer, "active" integer DEFAULT '1', "update_date" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_1de6a4421ff0c410d75af27aeee" PRIMARY KEY ("product_id"))`);
        await queryRunner.query(`CREATE TABLE "product-type" ("product_type_id" SERIAL NOT NULL, "type_name" character varying, "active" integer DEFAULT '1', "update_date" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_e7eae649e8dd6f3d171f245f135" PRIMARY KEY ("product_type_id"))`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_9c47355777d0ea7c76aa31059cd" FOREIGN KEY ("product_type_id") REFERENCES "product-type"("product_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_9c47355777d0ea7c76aa31059cd"`);
        await queryRunner.query(`DROP TABLE "product-type"`);
        await queryRunner.query(`DROP TABLE "product"`);
    }

}
