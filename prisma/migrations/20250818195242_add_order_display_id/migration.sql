/*
  Warnings:

  - Added the required column `displayId` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "locationId" TEXT,
    "merchantId" TEXT,
    "role" TEXT NOT NULL DEFAULT 'LOCATION_ADMIN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "admin_users_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "merchant_locations" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "admin_users_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "admin_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "admin_users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "opening_hours" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locationId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "openTime" TEXT,
    "closeTime" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "opening_hours_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "merchant_locations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "super_admins" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "super_admin_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "super_admin_sessions_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "super_admins" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "super_admin_otps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "super_admin_otps_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "super_admins" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_merchant_locations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "stripeConnectAccountId" TEXT,
    "stripeConnectEnabled" BOOLEAN NOT NULL DEFAULT false,
    "stripeConnectSetupAt" DATETIME,
    CONSTRAINT "merchant_locations_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_merchant_locations" ("address", "createdAt", "email", "id", "isActive", "merchantId", "name", "phone", "slug", "updatedAt") SELECT "address", "createdAt", "email", "id", "isActive", "merchantId", "name", "phone", "slug", "updatedAt" FROM "merchant_locations";
DROP TABLE "merchant_locations";
ALTER TABLE "new_merchant_locations" RENAME TO "merchant_locations";
CREATE UNIQUE INDEX "merchant_locations_merchantId_slug_key" ON "merchant_locations"("merchantId", "slug");
CREATE TABLE "new_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayId" INTEGER NOT NULL,
    "locationId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "totalAmount" DECIMAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLACED',
    "fulfilmentType" TEXT NOT NULL DEFAULT 'PICKUP',
    "estimatedPickupTime" DATETIME,
    "pickupTime" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "stripePaymentIntentId" TEXT,
    "stripeCheckoutSessionId" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentAmount" DECIMAL,
    "paymentCapturedAmount" DECIMAL,
    "paymentCapturedAt" DATETIME,
    CONSTRAINT "orders_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "merchant_locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_orders" ("createdAt", "customerEmail", "customerName", "customerPhone", "estimatedPickupTime", "fulfilmentType", "id", "locationId", "notes", "pickupTime", "status", "totalAmount", "updatedAt") SELECT "createdAt", "customerEmail", "customerName", "customerPhone", "estimatedPickupTime", "fulfilmentType", "id", "locationId", "notes", "pickupTime", "status", "totalAmount", "updatedAt" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE UNIQUE INDEX "orders_displayId_key" ON "orders"("displayId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_sessions_token_key" ON "admin_sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "opening_hours_locationId_dayOfWeek_key" ON "opening_hours"("locationId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "super_admins_email_key" ON "super_admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "super_admin_sessions_token_key" ON "super_admin_sessions"("token");
