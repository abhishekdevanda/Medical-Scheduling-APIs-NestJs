import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedAppointmentTable1752060334301 implements MigrationInterface {
    name = 'UpdatedAppointmentTable1752060334301'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "UQ_fb92c47131d1e8896b06fd6c1b9"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "UQ_fb92c47131d1e8896b06fd6c1b9" UNIQUE ("patient_id", "time_slot_id")`);
    }

}
