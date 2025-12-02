import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductVariantTable1764673595443 implements MigrationInterface {
    name = 'ProductVariantTable1764673595443'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_details" DROP CONSTRAINT "FK_c67ebaba3e5085b6401911acc70"`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP COLUMN "size"`);
        await queryRunner.query(`DROP TYPE "public"."order_details_size_enum"`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP COLUMN "productId"`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD "unitPrice" numeric(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD "variantId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD CONSTRAINT "FK_89c2973115552c0e23a73787a18" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_details" DROP CONSTRAINT "FK_89c2973115552c0e23a73787a18"`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP COLUMN "variantId"`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP COLUMN "unitPrice"`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD "productId" integer`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD "price" numeric(10,2) NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."order_details_size_enum" AS ENUM('Baby size (18-20cm)', 'Minisize (28-30cm)', 'Bigsize (38-40cm)', 'Free size')`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD "size" "public"."order_details_size_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD CONSTRAINT "FK_c67ebaba3e5085b6401911acc70" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
