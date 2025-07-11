import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedAppointmentTable1752047177808 implements MigrationInterface {
    name = 'AddedAppointmentTable1752047177808'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."appointments_appointment_status_enum" AS ENUM('scheduled', 'cancelled', 'completed')`);
        await queryRunner.query(`CREATE TABLE "appointments" ("appointment_id" SERIAL NOT NULL, "appointment_status" "public"."appointments_appointment_status_enum" NOT NULL DEFAULT 'scheduled', "scheduled_on" TIMESTAMP NOT NULL, "reason" character varying, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "doctor_id" integer, "patient_id" integer, "time_slot_id" integer, CONSTRAINT "UQ_fb92c47131d1e8896b06fd6c1b9" UNIQUE ("patient_id", "time_slot_id"), CONSTRAINT "PK_dde485d1b7ca51845c075befb6b" PRIMARY KEY ("appointment_id"))`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_4cf26c3f972d014df5c68d503d2" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_3330f054416745deaa2cc130700" FOREIGN KEY ("patient_id") REFERENCES "patients"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_5019db00ff2d18f536272643b45" FOREIGN KEY ("time_slot_id") REFERENCES "doctor_time_slots"("timeslot_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_5019db00ff2d18f536272643b45"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_3330f054416745deaa2cc130700"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_4cf26c3f972d014df5c68d503d2"`);
        await queryRunner.query(`DROP TABLE "appointments"`);
        await queryRunner.query(`DROP TYPE "public"."appointments_appointment_status_enum"`);
    }

}
