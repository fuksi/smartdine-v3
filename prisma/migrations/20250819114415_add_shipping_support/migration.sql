-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "deliveryAddress" TEXT,
ADD COLUMN     "deliveryCity" TEXT,
ADD COLUMN     "deliveryPostalCode" TEXT,
ADD COLUMN     "shippingCost" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "canShip" BOOLEAN NOT NULL DEFAULT false;
