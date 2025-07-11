import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedDoctorAvailabilityTable1752046779875 implements MigrationInterface {
    name = 'AddedDoctorAvailabilityTable1752046779875'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."doctor_availabilities_session_enum" AS ENUM('Morning', 'Evening')`);
        await queryRunner.query(`CREATE TYPE "public"."doctor_availabilities_weekdays_enum" AS ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')`);
        await queryRunner.query(`CREATE TABLE "doctor_availabilities" ("availability_id" SERIAL NOT NULL, "date" date NOT NULL, "consulting_start_time" TIME NOT NULL, "consulting_end_time" TIME NOT NULL, "session" "public"."doctor_availabilities_session_enum" NOT NULL, "weekdays" "public"."doctor_availabilities_weekdays_enum" array, "booking_start_at" TIMESTAMP NOT NULL, "booking_end_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "doctor_id" integer, CONSTRAINT "UQ_caee4f0dd834e63091191e0b4ee" UNIQUE ("doctor_id", "date", "session", "consulting_start_time", "consulting_end_time"), CONSTRAINT "PK_b72e631ea2d3dc4d641e030ccc1" PRIMARY KEY ("availability_id"))`);
        await queryRunner.query(`ALTER TABLE "doctor_availabilities" ADD CONSTRAINT "FK_aa49ce7b9ff575a2963abcb6910" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_availabilities" DROP CONSTRAINT "FK_aa49ce7b9ff575a2963abcb6910"`);
        await queryRunner.query(`DROP TABLE "doctor_availabilities"`);
        await queryRunner.query(`DROP TYPE "public"."doctor_availabilities_weekdays_enum"`);
        await queryRunner.query(`DROP TYPE "public"."doctor_availabilities_session_enum"`);
    }

}
