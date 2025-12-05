import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterOrderNote1765000000000 implements MigrationInterface {
  name = 'AlterOrderNote1765000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "note"`);
    await queryRunner.query(
      `ALTER TABLE "order_details" ADD "note" character varying(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_details" DROP COLUMN "note"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "note" character varying(255)`,
    );
  }
}


