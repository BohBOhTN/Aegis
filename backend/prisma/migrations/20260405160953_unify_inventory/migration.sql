/*
  Warnings:

  - You are about to drop the column `fromLoc` on the `inventory_movements` table. All the data in the column will be lost.
  - You are about to drop the column `toLoc` on the `inventory_movements` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `products` table. All the data in the column will be lost.
  - You are about to drop the `inventory_levels` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PurchaseDocumentType" AS ENUM ('BON_COMMANDE', 'BON_RECEPTION', 'FACTURE_FOURNISSEUR');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('DRAFT', 'VALIDATED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "inventory_levels" DROP CONSTRAINT "inventory_levels_productId_fkey";

-- DropForeignKey
ALTER TABLE "inventory_levels" DROP CONSTRAINT "inventory_levels_warehouseId_fkey";

-- AlterTable
ALTER TABLE "inventory_movements" DROP COLUMN "fromLoc",
DROP COLUMN "toLoc",
ADD COLUMN     "createdByUserId" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "fromPosId" TEXT,
ADD COLUMN     "fromWarehouseId" TEXT,
ADD COLUMN     "toPosId" TEXT,
ADD COLUMN     "toWarehouseId" TEXT;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "category",
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "unitId" TEXT;

-- DropTable
DROP TABLE "inventory_levels";

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_history" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "oldPurchasePrice" DECIMAL(10,3) NOT NULL,
    "newPurchasePrice" DECIMAL(10,3) NOT NULL,
    "oldSellingPrice" DECIMAL(10,3) NOT NULL,
    "newSellingPrice" DECIMAL(10,3) NOT NULL,
    "reason" TEXT,
    "changedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_inventory" (
    "productId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL DEFAULT 0.00,
    "minThreshold" DECIMAL(10,3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_inventory_pkey" PRIMARY KEY ("productId","warehouseId")
);

-- CreateTable
CREATE TABLE "pos_inventory" (
    "productId" TEXT NOT NULL,
    "posId" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL DEFAULT 0.00,
    "minThreshold" DECIMAL(10,3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pos_inventory_pkey" PRIMARY KEY ("productId","posId")
);

-- CreateTable
CREATE TABLE "purchase_documents" (
    "id" TEXT NOT NULL,
    "documentNum" TEXT NOT NULL,
    "type" "PurchaseDocumentType" NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'DRAFT',
    "supplierId" TEXT NOT NULL,
    "receivedAtWarehouseId" TEXT,
    "receivedAtPosId" TEXT,
    "totalHT" DECIMAL(10,3) NOT NULL DEFAULT 0.00,
    "tva" DECIMAL(10,3) NOT NULL DEFAULT 0.00,
    "totalTTC" DECIMAL(10,3) NOT NULL DEFAULT 0.00,
    "amountPaid" DECIMAL(10,3) NOT NULL DEFAULT 0.00,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "documentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "purchase_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_document_lines" (
    "id" TEXT NOT NULL,
    "purchaseDocumentId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unitPrice" DECIMAL(10,3) NOT NULL,
    "totalPrice" DECIMAL(10,3) NOT NULL,

    CONSTRAINT "purchase_document_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_payments" (
    "id" TEXT NOT NULL,
    "purchaseDocumentId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "amount" DECIMAL(10,3) NOT NULL,
    "method" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "units_name_key" ON "units"("name");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_documents_documentNum_key" ON "purchase_documents"("documentNum");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_inventory" ADD CONSTRAINT "warehouse_inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_inventory" ADD CONSTRAINT "warehouse_inventory_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_inventory" ADD CONSTRAINT "pos_inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_inventory" ADD CONSTRAINT "pos_inventory_posId_fkey" FOREIGN KEY ("posId") REFERENCES "points_of_sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_documents" ADD CONSTRAINT "purchase_documents_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_document_lines" ADD CONSTRAINT "purchase_document_lines_purchaseDocumentId_fkey" FOREIGN KEY ("purchaseDocumentId") REFERENCES "purchase_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_document_lines" ADD CONSTRAINT "purchase_document_lines_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_payments" ADD CONSTRAINT "supplier_payments_purchaseDocumentId_fkey" FOREIGN KEY ("purchaseDocumentId") REFERENCES "purchase_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_payments" ADD CONSTRAINT "supplier_payments_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
