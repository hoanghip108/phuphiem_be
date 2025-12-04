import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableOrders1764833537762 implements MigrationInterface {
  name = 'AlterTableOrders1764833537762';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" ADD "userId" integer`);

    // Gán userId cho các record orders cũ chưa có userId
    // Ở đây chọn user đầu tiên trong bảng users làm chủ sở hữu mặc định
    await queryRunner.query(`
      UPDATE "orders"
      SET "userId" = sub."id"
      FROM (
        SELECT "id"
        FROM "users"
        ORDER BY "id"
        LIMIT 1
      ) AS sub
      WHERE "orders"."userId" IS NULL;
    `);

    // Sau khi dữ liệu đã được gán, set NOT NULL cho cột userId
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "userId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`,
    );
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "userId"`);
  }
}
