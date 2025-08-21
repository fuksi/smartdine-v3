/*
  Warnings:

  - The values [LOCATION_ADMIN] on the enum `admin_role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `locationId` on the `admin_users` table. All the data in the column will be lost.
  - You are about to drop the column `locationId` on the `menus` table. All the data in the column will be lost.
  - You are about to drop the column `locationId` on the `opening_hours` table. All the data in the column will be lost.
  - You are about to drop the column `locationId` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `locationId` on the `stamp_cards` table. All the data in the column will be lost.
  - You are about to drop the `merchant_locations` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[merchantId]` on the table `menus` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[merchantId,dayOfWeek]` on the table `opening_hours` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[merchantId,phoneNumber]` on the table `stamp_cards` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `merchantId` to the `menus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `merchants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `merchantId` to the `opening_hours` table without a default value. This is not possible if the table is not empty.
  - Added the required column `merchantId` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `merchantId` to the `stamp_cards` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."admin_role_new" AS ENUM ('MERCHANT_ADMIN', 'SUPER_ADMIN');
ALTER TABLE "public"."admin_users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."admin_users" ALTER COLUMN "role" TYPE "public"."admin_role_new" USING ("role"::text::"public"."admin_role_new");
ALTER TYPE "public"."admin_role" RENAME TO "admin_role_old";
ALTER TYPE "public"."admin_role_new" RENAME TO "admin_role";
DROP TYPE "public"."admin_role_old";
ALTER TABLE "public"."admin_users" ALTER COLUMN "role" SET DEFAULT 'MERCHANT_ADMIN';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."admin_users" DROP CONSTRAINT "admin_users_locationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."menus" DROP CONSTRAINT "menus_locationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."merchant_locations" DROP CONSTRAINT "merchant_locations_merchantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."opening_hours" DROP CONSTRAINT "opening_hours_locationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."orders" DROP CONSTRAINT "orders_locationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."stamp_cards" DROP CONSTRAINT "stamp_cards_locationId_fkey";

-- DropIndex
DROP INDEX "public"."menus_locationId_key";

-- DropIndex
DROP INDEX "public"."opening_hours_locationId_dayOfWeek_key";

-- DropIndex
DROP INDEX "public"."stamp_cards_locationId_phoneNumber_key";

-- AlterTable
ALTER TABLE "public"."admin_users" DROP COLUMN "locationId",
ALTER COLUMN "role" SET DEFAULT 'MERCHANT_ADMIN';

-- AlterTable
ALTER TABLE "public"."categories" ADD COLUMN     "canShip" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."menus" DROP COLUMN "locationId",
ADD COLUMN     "merchantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."merchants" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "stripeConnectAccountId" TEXT,
ADD COLUMN     "stripeConnectEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeConnectSetupAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."opening_hours" DROP COLUMN "locationId",
ADD COLUMN     "merchantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."orders" DROP COLUMN "locationId",
ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "merchantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."stamp_cards" DROP COLUMN "locationId",
ADD COLUMN     "merchantId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."merchant_locations";

-- CreateTable
CREATE TABLE "public"."customers" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customer_sessions" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customer_otps" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_phone_key" ON "public"."customers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "customer_sessions_token_key" ON "public"."customer_sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "menus_merchantId_key" ON "public"."menus"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "opening_hours_merchantId_dayOfWeek_key" ON "public"."opening_hours"("merchantId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "stamp_cards_merchantId_phoneNumber_key" ON "public"."stamp_cards"("merchantId", "phoneNumber");

-- AddForeignKey
ALTER TABLE "public"."menus" ADD CONSTRAINT "menus_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "public"."merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "public"."merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."opening_hours" ADD CONSTRAINT "opening_hours_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "public"."merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stamp_cards" ADD CONSTRAINT "stamp_cards_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "public"."merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_sessions" ADD CONSTRAINT "customer_sessions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_otps" ADD CONSTRAINT "customer_otps_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
