import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedDoctorTimeslotTable1752046933681 implements MigrationInterface {
    name = 'AddedDoctorTimeslotTable1752046933681'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."doctor_time_slots_session_enum" AS ENUM('Morning', 'Evening')`);
        await queryRunner.query(`CREATE TYPE "public"."doctor_time_slots_status_enum" AS ENUM('available', 'booked', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "doctor_time_slots" ("timeslot_id" SERIAL NOT NULL, "date" date NOT NULL, "session" "public"."doctor_time_slots_session_enum" NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "status" "public"."doctor_time_slots_status_enum" NOT NULL DEFAULT 'available', "max_patients" integer NOT NULL, "is_deleted" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "doctor_id" integer, "availability_id" integer, CONSTRAINT "PK_8ae12dfe3687c8c338b5f24f4cf" PRIMARY KEY ("timeslot_id"))`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slots" ADD CONSTRAINT "FK_2cedde845f4a3669d3fa669c1cf" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slots" ADD CONSTRAINT "FK_2f49b486fc98e4de92becb5fb6c" FOREIGN KEY ("availability_id") REFERENCES "doctor_availabilities"("availability_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_time_slots" DROP CONSTRAINT "FK_2f49b486fc98e4de92becb5fb6c"`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slots" DROP CONSTRAINT "FK_2cedde845f4a3669d3fa669c1cf"`);
        await queryRunner.query(`DROP TABLE "doctor_time_slots"`);
        await queryRunner.query(`DROP TYPE "public"."doctor_time_slots_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."doctor_time_slots_session_enum"`);
    }

}
