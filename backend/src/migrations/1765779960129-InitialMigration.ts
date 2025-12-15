import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1765779960129 implements MigrationInterface {
    name = 'InitialMigration1765779960129'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "purchase_order_item" ("po_item_id" SERIAL NOT NULL, "po_id" integer NOT NULL, "material_id" integer NOT NULL, "quantity" numeric(10,2) NOT NULL, "unit_price" numeric(10,2) NOT NULL, "subtotal" numeric(10,2) NOT NULL, CONSTRAINT "PK_721d9bd4074183ae82162ae13ce" PRIMARY KEY ("po_item_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."purchase_order_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'DELAYED')`);
        await queryRunner.query(`CREATE TABLE "purchase_order" ("po_id" SERIAL NOT NULL, "po_number" character varying NOT NULL, "supplier_id" integer NOT NULL, "order_date" TIMESTAMP NOT NULL, "expected_delivery_date" TIMESTAMP NOT NULL, "actual_delivery_date" TIMESTAMP, "status" "public"."purchase_order_status_enum" NOT NULL DEFAULT 'PENDING', "total_amount" numeric(10,2) NOT NULL DEFAULT '0', "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_5a2085d0e852c3286a6a55fe691" UNIQUE ("po_number"), CONSTRAINT "PK_cec4a4cdf2d77a8a9e988dfa184" PRIMARY KEY ("po_id"))`);
        await queryRunner.query(`ALTER TABLE "purchase_order_item" ADD CONSTRAINT "FK_a03a2db737d8b96ea8607fa1c7d" FOREIGN KEY ("po_id") REFERENCES "purchase_order"("po_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_order_item" ADD CONSTRAINT "FK_0eb3123d990d98729b15009dc94" FOREIGN KEY ("material_id") REFERENCES "material_master"("material_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_order" ADD CONSTRAINT "FK_3dacab5c4a43cecc0e48f5edb12" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("supplier_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_order" DROP CONSTRAINT "FK_3dacab5c4a43cecc0e48f5edb12"`);
        await queryRunner.query(`ALTER TABLE "purchase_order_item" DROP CONSTRAINT "FK_0eb3123d990d98729b15009dc94"`);
        await queryRunner.query(`ALTER TABLE "purchase_order_item" DROP CONSTRAINT "FK_a03a2db737d8b96ea8607fa1c7d"`);
        await queryRunner.query(`DROP TABLE "purchase_order"`);
        await queryRunner.query(`DROP TYPE "public"."purchase_order_status_enum"`);
        await queryRunner.query(`DROP TABLE "purchase_order_item"`);
    }

}
