import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedDoctorTable1752046504067 implements MigrationInterface {
    name = 'AddedDoctorTable1752046504067'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."doctors_schedule_type_enum" AS ENUM('stream', 'wave')`);
        await queryRunner.query(`CREATE TABLE "doctors" ("user_id" integer NOT NULL, "education" character varying NOT NULL, "specialization" character varying NOT NULL, "experience_years" integer NOT NULL, "clinic_name" character varying NOT NULL, "clinic_address" character varying NOT NULL, "schedule_type" "public"."doctors_schedule_type_enum" NOT NULL DEFAULT 'wave', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_653c27d1b10652eb0c7bbbc4427" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`ALTER TABLE "doctors" ADD CONSTRAINT "FK_653c27d1b10652eb0c7bbbc4427" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctors" DROP CONSTRAINT "FK_653c27d1b10652eb0c7bbbc4427"`);
        await queryRunner.query(`DROP TABLE "doctors"`);
        await queryRunner.query(`DROP TYPE "public"."doctors_schedule_type_enum"`);
    }

}
