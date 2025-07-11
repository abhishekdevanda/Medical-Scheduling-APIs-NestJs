import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedAvailabilityTable1752055369565 implements MigrationInterface {
    name = 'UpdatedAvailabilityTable1752055369565'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_availabilities" DROP CONSTRAINT "UQ_caee4f0dd834e63091191e0b4ee"`);
        await queryRunner.query(`ALTER TYPE "public"."doctor_time_slots_status_enum" RENAME TO "doctor_time_slots_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."doctor_time_slots_status_enum" AS ENUM('available', 'booked')`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slots" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slots" ALTER COLUMN "status" TYPE "public"."doctor_time_slots_status_enum" USING "status"::"text"::"public"."doctor_time_slots_status_enum"`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slots" ALTER COLUMN "status" SET DEFAULT 'available'`);
        await queryRunner.query(`DROP TYPE "public"."doctor_time_slots_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."doctor_time_slots_status_enum_old" AS ENUM('available', 'booked', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slots" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slots" ALTER COLUMN "status" TYPE "public"."doctor_time_slots_status_enum_old" USING "status"::"text"::"public"."doctor_time_slots_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slots" ALTER COLUMN "status" SET DEFAULT 'available'`);
        await queryRunner.query(`DROP TYPE "public"."doctor_time_slots_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."doctor_time_slots_status_enum_old" RENAME TO "doctor_time_slots_status_enum"`);
        await queryRunner.query(`ALTER TABLE "doctor_availabilities" ADD CONSTRAINT "UQ_caee4f0dd834e63091191e0b4ee" UNIQUE ("date", "consulting_start_time", "consulting_end_time", "session", "doctor_id")`);
    }

}
