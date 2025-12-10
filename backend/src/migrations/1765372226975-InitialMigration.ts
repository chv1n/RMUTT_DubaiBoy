import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1765372226975 implements MigrationInterface {
    name = 'InitialMigration1765372226975'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "push_log" ("id" SERIAL NOT NULL, "subscription_id" integer NOT NULL, "user_id" integer, "title" character varying NOT NULL, "message" text NOT NULL, "payload_json" json, "status" character varying(20) NOT NULL, "error_message" text, "sent_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b559798a8c2869db3ff8846ccab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "push_subscription" ("id" SERIAL NOT NULL, "endpoint" character varying(255) NOT NULL, "user_id" integer NOT NULL, "p256dh" json NOT NULL, "auth" json NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_07fc861c0d2c38c1b830fb9cb5d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "push_log" ADD CONSTRAINT "FK_e29938a9d50af45ef0ebb8a28d5" FOREIGN KEY ("subscription_id") REFERENCES "push_subscription"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "push_subscription" ADD CONSTRAINT "FK_ae9b58d71ea5fff546507fae207" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "push_subscription" DROP CONSTRAINT "FK_ae9b58d71ea5fff546507fae207"`);
        await queryRunner.query(`ALTER TABLE "push_log" DROP CONSTRAINT "FK_e29938a9d50af45ef0ebb8a28d5"`);
        await queryRunner.query(`DROP TABLE "push_subscription"`);
        await queryRunner.query(`DROP TABLE "push_log"`);
    }

}
