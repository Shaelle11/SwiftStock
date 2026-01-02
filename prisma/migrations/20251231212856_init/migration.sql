/*
  Warnings:

  - You are about to drop the column `totalPrice` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `sale_items` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `sales` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `sales` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cartId,productId]` on the table `cart_items` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orderNumber]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productName` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerEmail` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerFirstName` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerLastName` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerPhone` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderNumber` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productName` to the `sale_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `sale_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxableAmount` to the `sales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `tools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `tools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `datePurchased` to the `tools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `department` to the `tools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemNumber` to the `tools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `manufacturer` to the `tools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `tools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project` to the `tools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serialNumber` to the `tools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `store` to the `tools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `tools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitOfMeasurement` to the `tools` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `tools` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "carts" DROP CONSTRAINT "carts_customerId_fkey";

-- DropForeignKey
ALTER TABLE "carts" DROP CONSTRAINT "carts_storeId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_customerId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_storeId_fkey";

-- DropForeignKey
ALTER TABLE "sales" DROP CONSTRAINT "sales_customerId_fkey";

-- DropForeignKey
ALTER TABLE "sales" DROP CONSTRAINT "sales_storeId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_storeId_fkey";

-- AlterTable
ALTER TABLE "carts" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ALTER COLUMN "customerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "totalPrice",
ADD COLUMN     "productName" TEXT NOT NULL,
ADD COLUMN     "subtotal" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "customerAddress" TEXT,
ADD COLUMN     "customerEmail" TEXT NOT NULL,
ADD COLUMN     "customerFirstName" TEXT NOT NULL,
ADD COLUMN     "customerLastName" TEXT NOT NULL,
ADD COLUMN     "customerPhone" TEXT NOT NULL,
ADD COLUMN     "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "orderNumber" TEXT NOT NULL,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "shipping" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "taxableAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "vatAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "customerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "sale_items" DROP COLUMN "totalPrice",
ADD COLUMN     "productName" TEXT NOT NULL,
ADD COLUMN     "subtotal" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "sales" DROP COLUMN "status",
DROP COLUMN "updatedAt",
ADD COLUMN     "taxableAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "vatAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "tools" ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "datePurchased" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "department" TEXT NOT NULL,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "itemNumber" TEXT NOT NULL,
ADD COLUMN     "manufacturer" TEXT NOT NULL,
ADD COLUMN     "piDocumentUrl" TEXT,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "project" TEXT NOT NULL,
ADD COLUMN     "serialNumber" TEXT NOT NULL,
ADD COLUMN     "store" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "unitOfMeasurement" TEXT NOT NULL,
ADD COLUMN     "warrantyUrl" TEXT,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "store_settings" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "vatEnabled" BOOLEAN NOT NULL DEFAULT true,
    "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 0.075,
    "taxIdNumber" TEXT,
    "businessRegNumber" TEXT,
    "businessType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_records" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "saleId" TEXT,
    "orderId" TEXT,
    "taxableAmount" DOUBLE PRECISION NOT NULL,
    "vatRate" DOUBLE PRECISION NOT NULL,
    "vatCollected" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "transactionType" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "taxPeriod" TEXT NOT NULL,
    "taxYear" INTEGER NOT NULL,
    "taxMonth" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tax_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_summaries" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "totalSales" DOUBLE PRECISION NOT NULL,
    "totalVatCollected" DOUBLE PRECISION NOT NULL,
    "totalOrders" INTEGER NOT NULL,
    "totalRevenue" DOUBLE PRECISION NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isFinalized" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tax_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "store_settings_storeId_key" ON "store_settings"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "tax_records_saleId_key" ON "tax_records"("saleId");

-- CreateIndex
CREATE UNIQUE INDEX "tax_records_orderId_key" ON "tax_records"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "tax_summaries_storeId_period_key" ON "tax_summaries"("storeId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cartId_productId_key" ON "cart_items"("cartId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_settings" ADD CONSTRAINT "store_settings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_records" ADD CONSTRAINT "tax_records_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_records" ADD CONSTRAINT "tax_records_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_records" ADD CONSTRAINT "tax_records_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_summaries" ADD CONSTRAINT "tax_summaries_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
