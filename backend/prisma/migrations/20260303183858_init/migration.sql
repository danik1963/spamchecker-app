-- CreateEnum
CREATE TYPE "PhoneCategory" AS ENUM ('spam', 'fraud', 'unknown');

-- CreateEnum
CREATE TYPE "PhoneStatus" AS ENUM ('pending', 'confirmed');

-- CreateTable
CREATE TABLE "phone_numbers" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "category" "PhoneCategory" NOT NULL DEFAULT 'spam',
    "status" "PhoneStatus" NOT NULL DEFAULT 'pending',
    "reports_count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phone_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "phone_id" TEXT NOT NULL,
    "category" "PhoneCategory" NOT NULL,
    "description" TEXT,
    "device_id" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "phone_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "phone_numbers_phone_key" ON "phone_numbers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "reports_phone_id_device_id_key" ON "reports"("phone_id", "device_id");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_phone_id_fkey" FOREIGN KEY ("phone_id") REFERENCES "phone_numbers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_phone_id_fkey" FOREIGN KEY ("phone_id") REFERENCES "phone_numbers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
