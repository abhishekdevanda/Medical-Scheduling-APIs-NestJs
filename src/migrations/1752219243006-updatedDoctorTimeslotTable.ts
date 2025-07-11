import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatedDoctorTimeslotTable1752219243006
  implements MigrationInterface
{
  name = 'UpdatedDoctorTimeslotTable1752219243006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "doctor_time_slots" DROP COLUMN "date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_time_slots" DROP COLUMN "session"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."doctor_time_slots_session_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."doctor_time_slots_session_enum" AS ENUM('Morning', 'Evening')`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_time_slots" ADD "session" "public"."doctor_time_slots_session_enum" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_time_slots" ADD "date" date NOT NULL`,
    );
  }
}
