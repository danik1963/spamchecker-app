/*
  Warnings:

  - You are about to drop the column `phone_id` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `phone_id` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the `phone_numbers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[record_id,device_id]` on the table `reports` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `record_id` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `record_id` to the `reports` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `category` on the `reports` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('phone', 'instagram', 'whatsapp', 'telegram');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('spam', 'fraud', 'scam', 'fake', 'unknown');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('pending', 'confirmed');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('admin', 'moderator');

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_phone_id_fkey";

-- DropForeignKey
ALTER TABLE "reports" DROP CONSTRAINT "reports_phone_id_fkey";

-- DropIndex
DROP INDEX "reports_phone_id_device_id_key";

-- AlterTable
ALTER TABLE "comments" DROP COLUMN "phone_id",
ADD COLUMN     "author" TEXT NOT NULL DEFAULT 'Аноним',
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "parent_id" TEXT,
ADD COLUMN     "record_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "reports" DROP COLUMN "phone_id",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_valid" BOOLEAN,
ADD COLUMN     "record_id" TEXT NOT NULL,
DROP COLUMN "category",
ADD COLUMN     "category" "Category" NOT NULL;

-- DropTable
DROP TABLE "phone_numbers";

-- DropEnum
DROP TYPE "PhoneCategory";

-- DropEnum
DROP TYPE "PhoneStatus";

-- CreateTable
CREATE TABLE "spam_records" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "platform" "Platform" NOT NULL DEFAULT 'phone',
    "category" "Category" NOT NULL DEFAULT 'spam',
    "status" "Status" NOT NULL DEFAULT 'pending',
    "reports_count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "hidden_at" TIMESTAMP(3),

    CONSTRAINT "spam_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'moderator',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_logs" (
    "id" TEXT NOT NULL,
    "admin_user_id" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "spam_records_identifier_platform_key" ON "spam_records"("identifier", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_username_key" ON "admin_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "reports_record_id_device_id_key" ON "reports"("record_id", "device_id");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "spam_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "spam_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
