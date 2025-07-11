import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedPatientTable1752046338879 implements MigrationInterface {
    name = 'AddedPatientTable1752046338879'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "patients" ("user_id" integer NOT NULL, "age" integer NOT NULL, "gender" character varying NOT NULL, "address" character varying NOT NULL, "emergency_contact" character varying NOT NULL, "medical_history" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7fe1518dc780fd777669b5cb7a0" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "FK_7fe1518dc780fd777669b5cb7a0" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "FK_7fe1518dc780fd777669b5cb7a0"`);
        await queryRunner.query(`DROP TABLE "patients"`);
    }

}
