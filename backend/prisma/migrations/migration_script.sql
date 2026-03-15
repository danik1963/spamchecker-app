-- Миграция данных из старой схемы в новую

-- 1. Создаём новую таблицу spam_records
CREATE TABLE IF NOT EXISTS "spam_records" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'phone',
    "category" TEXT NOT NULL DEFAULT 'spam',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reports_count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "spam_records_pkey" PRIMARY KEY ("id")
);

-- 2. Переносим данные из phone_numbers в spam_records
INSERT INTO "spam_records" ("id", "identifier", "platform", "category", "status", "reports_count", "created_at", "updated_at")
SELECT 
    "id",
    "phone" as "identifier",
    'phone' as "platform",
    CAST("category" AS TEXT),
    CAST("status" AS TEXT),
    "reports_count",
    "created_at",
    "updated_at"
FROM "phone_numbers";

-- 3. Создаём временные таблицы для reports и comments
CREATE TABLE "reports_new" (
    "id" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "device_id" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reports_new_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "comments_new" (
    "id" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "author" TEXT NOT NULL DEFAULT 'Аноним',
    "text" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "device_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "comments_new_pkey" PRIMARY KEY ("id")
);

-- 4. Переносим данные из reports
INSERT INTO "reports_new" ("id", "record_id", "category", "description", "device_id", "ip_address", "created_at")
SELECT 
    "id",
    "phone_id" as "record_id",
    CAST("category" AS TEXT),
    "description",
    "device_id",
    "ip_address",
    "created_at"
FROM "reports";

-- 5. Переносим данные из comments
INSERT INTO "comments_new" ("id", "record_id", "parent_id", "author", "text", "likes", "device_id", "created_at")
SELECT 
    "id",
    "phone_id" as "record_id",
    NULL as "parent_id",
    'Аноним_' || FLOOR(RANDOM() * 9999)::TEXT as "author",
    "text",
    0 as "likes",
    "device_id",
    "created_at"
FROM "comments";

-- 6. Удаляем старые таблицы
DROP TABLE IF EXISTS "comments" CASCADE;
DROP TABLE IF EXISTS "reports" CASCADE;
DROP TABLE IF EXISTS "phone_numbers" CASCADE;

-- 7. Переименовываем новые таблицы
ALTER TABLE "reports_new" RENAME TO "reports";
ALTER TABLE "comments_new" RENAME TO "comments";

-- 8. Создаём индексы и ограничения
CREATE UNIQUE INDEX "spam_records_identifier_platform_key" ON "spam_records"("identifier", "platform");
CREATE UNIQUE INDEX "reports_record_id_device_id_key" ON "reports"("record_id", "device_id");

-- 9. Добавляем внешние ключи
ALTER TABLE "reports" ADD CONSTRAINT "reports_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "spam_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "spam_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 10. Создаём ENUM типы (если PostgreSQL поддерживает)
DO $$ BEGIN
    CREATE TYPE "Platform" AS ENUM ('phone', 'instagram', 'whatsapp', 'telegram');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "Category" AS ENUM ('spam', 'fraud', 'scam', 'fake', 'unknown');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "Status" AS ENUM ('pending', 'confirmed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 11. Обновляем типы колонок на ENUM
ALTER TABLE "spam_records" ALTER COLUMN "platform" TYPE "Platform" USING "platform"::"Platform";
ALTER TABLE "spam_records" ALTER COLUMN "category" TYPE "Category" USING "category"::"Category";
ALTER TABLE "spam_records" ALTER COLUMN "status" TYPE "Status" USING "status"::"Status";
ALTER TABLE "reports" ALTER COLUMN "category" TYPE "Category" USING "category"::"Category";
