import { MigrationInterface, QueryRunner } from 'typeorm';

export class FreshMigrations1751827376084 implements MigrationInterface {
  name = 'FreshMigrations1751827376084';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "patients" ("user_id" integer NOT NULL, "age" integer NOT NULL, "gender" character varying NOT NULL, "address" character varying NOT NULL, "emergency_contact" character varying NOT NULL, "medical_history" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7fe1518dc780fd777669b5cb7a0" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."appointments_appointment_status_enum" AS ENUM('scheduled', 'cancelled', 'completed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "appointments" ("appointment_id" SERIAL NOT NULL, "appointment_status" "public"."appointments_appointment_status_enum" NOT NULL DEFAULT 'scheduled', "scheduled_on" TIMESTAMP NOT NULL, "reason" character varying, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "doctor_id" integer, "patient_id" integer, "time_slot_id" integer, CONSTRAINT "UQ_fb92c47131d1e8896b06fd6c1b9" UNIQUE ("patient_id", "time_slot_id"), CONSTRAINT "PK_dde485d1b7ca51845c075befb6b" PRIMARY KEY ("appointment_id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."doctor_time_slots_session_enum" AS ENUM('Morning', 'Evening')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."doctor_time_slots_status_enum" AS ENUM('available', 'booked', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "doctor_time_slots" ("timeslot_id" SERIAL NOT NULL, "date" date NOT NULL, "session" "public"."doctor_time_slots_session_enum" NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "status" "public"."doctor_time_slots_status_enum" NOT NULL DEFAULT 'available', "max_patients" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "doctor_id" integer, "availability_id" integer, CONSTRAINT "PK_8ae12dfe3687c8c338b5f24f4cf" PRIMARY KEY ("timeslot_id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."doctor_availabilities_session_enum" AS ENUM('Morning', 'Evening')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."doctor_availabilities_weekdays_enum" AS ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')`,
    );
    await queryRunner.query(
      `CREATE TABLE "doctor_availabilities" ("availability_id" SERIAL NOT NULL, "date" date NOT NULL, "consulting_start_time" TIME NOT NULL, "consulting_end_time" TIME NOT NULL, "session" "public"."doctor_availabilities_session_enum" NOT NULL, "weekdays" "public"."doctor_availabilities_weekdays_enum" array, "booking_start_at" TIMESTAMP NOT NULL, "booking_end_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "doctor_id" integer, CONSTRAINT "UQ_caee4f0dd834e63091191e0b4ee" UNIQUE ("doctor_id", "date", "session", "consulting_start_time", "consulting_end_time"), CONSTRAINT "PK_b72e631ea2d3dc4d641e030ccc1" PRIMARY KEY ("availability_id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."doctors_schedule_type_enum" AS ENUM('stream', 'wave')`,
    );
    await queryRunner.query(
      `CREATE TABLE "doctors" ("user_id" integer NOT NULL, "education" character varying NOT NULL, "specialization" character varying NOT NULL, "experience_years" integer NOT NULL, "clinic_name" character varying NOT NULL, "clinic_address" character varying NOT NULL, "schedule_type" "public"."doctors_schedule_type_enum" NOT NULL DEFAULT 'wave', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_653c27d1b10652eb0c7bbbc4427" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('doctor', 'patient')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_provider_enum" AS ENUM('local', 'google')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("user_id" SERIAL NOT NULL, "email" character varying NOT NULL, "password_hash" character varying, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "phone_number" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'patient', "provider" "public"."users_provider_enum" NOT NULL DEFAULT 'local', "hashed_refresh_token" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_96aac72f1574b88752e9fb00089" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "patients" ADD CONSTRAINT "FK_7fe1518dc780fd777669b5cb7a0" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_4cf26c3f972d014df5c68d503d2" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_3330f054416745deaa2cc130700" FOREIGN KEY ("patient_id") REFERENCES "patients"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_5019db00ff2d18f536272643b45" FOREIGN KEY ("time_slot_id") REFERENCES "doctor_time_slots"("timeslot_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_time_slots" ADD CONSTRAINT "FK_2cedde845f4a3669d3fa669c1cf" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_time_slots" ADD CONSTRAINT "FK_2f49b486fc98e4de92becb5fb6c" FOREIGN KEY ("availability_id") REFERENCES "doctor_availabilities"("availability_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_availabilities" ADD CONSTRAINT "FK_aa49ce7b9ff575a2963abcb6910" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctors" ADD CONSTRAINT "FK_653c27d1b10652eb0c7bbbc4427" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "doctors" DROP CONSTRAINT "FK_653c27d1b10652eb0c7bbbc4427"`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_availabilities" DROP CONSTRAINT "FK_aa49ce7b9ff575a2963abcb6910"`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_time_slots" DROP CONSTRAINT "FK_2f49b486fc98e4de92becb5fb6c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_time_slots" DROP CONSTRAINT "FK_2cedde845f4a3669d3fa669c1cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "FK_5019db00ff2d18f536272643b45"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "FK_3330f054416745deaa2cc130700"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "FK_4cf26c3f972d014df5c68d503d2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "patients" DROP CONSTRAINT "FK_7fe1518dc780fd777669b5cb7a0"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_provider_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TABLE "doctors"`);
    await queryRunner.query(`DROP TYPE "public"."doctors_schedule_type_enum"`);
    await queryRunner.query(`DROP TABLE "doctor_availabilities"`);
    await queryRunner.query(
      `DROP TYPE "public"."doctor_availabilities_weekdays_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."doctor_availabilities_session_enum"`,
    );
    await queryRunner.query(`DROP TABLE "doctor_time_slots"`);
    await queryRunner.query(
      `DROP TYPE "public"."doctor_time_slots_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."doctor_time_slots_session_enum"`,
    );
    await queryRunner.query(`DROP TABLE "appointments"`);
    await queryRunner.query(
      `DROP TYPE "public"."appointments_appointment_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "patients"`);
  }
}
