const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrate() {
  console.log('🔄 Начинаем миграцию данных...');

  try {
    // 1. Получаем все данные из старых таблиц
    const oldPhones = await prisma.$queryRaw`SELECT * FROM phone_numbers`;
    const oldReports = await prisma.$queryRaw`SELECT * FROM reports`;
    const oldComments = await prisma.$queryRaw`SELECT * FROM comments`;

    console.log(`📊 Найдено: ${oldPhones.length} телефонов, ${oldReports.length} жалоб, ${oldComments.length} комментариев`);

    // 2. Удаляем старые таблицы
    await prisma.$executeRaw`DROP TABLE IF EXISTS comments CASCADE`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS reports CASCADE`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS phone_numbers CASCADE`;
    
    // 3. Удаляем старые ENUM типы
    await prisma.$executeRaw`DROP TYPE IF EXISTS "PhoneCategory" CASCADE`;
    await prisma.$executeRaw`DROP TYPE IF EXISTS "PhoneStatus" CASCADE`;

    console.log('✅ Старые таблицы удалены');

    // 4. Применяем новую схему
    await prisma.$executeRaw`
      CREATE TYPE "Platform" AS ENUM ('phone', 'instagram', 'whatsapp', 'telegram');
    `;
    await prisma.$executeRaw`
      CREATE TYPE "Category" AS ENUM ('spam', 'fraud', 'scam', 'fake', 'unknown');
    `;
    await prisma.$executeRaw`
      CREATE TYPE "Status" AS ENUM ('pending', 'confirmed');
    `;

    await prisma.$executeRaw`
      CREATE TABLE "spam_records" (
        "id" TEXT NOT NULL,
        "identifier" TEXT NOT NULL,
        "platform" "Platform" NOT NULL DEFAULT 'phone',
        "category" "Category" NOT NULL DEFAULT 'spam',
        "status" "Status" NOT NULL DEFAULT 'pending',
        "reports_count" INTEGER NOT NULL DEFAULT 1,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "spam_records_pkey" PRIMARY KEY ("id")
      );
    `;

    await prisma.$executeRaw`
      CREATE TABLE "reports" (
        "id" TEXT NOT NULL,
        "record_id" TEXT NOT NULL,
        "category" "Category" NOT NULL,
        "description" TEXT,
        "device_id" TEXT NOT NULL,
        "ip_address" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
      );
    `;

    await prisma.$executeRaw`
      CREATE TABLE "comments" (
        "id" TEXT NOT NULL,
        "record_id" TEXT NOT NULL,
        "parent_id" TEXT,
        "author" TEXT NOT NULL DEFAULT 'Аноним',
        "text" TEXT NOT NULL,
        "likes" INTEGER NOT NULL DEFAULT 0,
        "device_id" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
      );
    `;

    console.log('✅ Новые таблицы созданы');

    // 5. Переносим данные
    for (const phone of oldPhones) {
      await prisma.$executeRaw`
        INSERT INTO spam_records (id, identifier, platform, category, status, reports_count, created_at, updated_at)
        VALUES (
          ${phone.id},
          ${phone.phone},
          'phone'::"Platform",
          ${phone.category}::"Category",
          ${phone.status}::"Status",
          ${phone.reports_count},
          ${phone.created_at},
          ${phone.updated_at}
        )
      `;
    }

    for (const report of oldReports) {
      await prisma.$executeRaw`
        INSERT INTO reports (id, record_id, category, description, device_id, ip_address, created_at)
        VALUES (
          ${report.id},
          ${report.phone_id},
          ${report.category}::"Category",
          ${report.description},
          ${report.device_id},
          ${report.ip_address},
          ${report.created_at}
        )
      `;
    }

    for (const comment of oldComments) {
      const author = `Аноним_${Math.floor(Math.random() * 9999)}`;
      await prisma.$executeRaw`
        INSERT INTO comments (id, record_id, parent_id, author, text, likes, device_id, created_at)
        VALUES (
          ${comment.id},
          ${comment.phone_id},
          NULL,
          ${author},
          ${comment.text},
          0,
          ${comment.device_id},
          ${comment.created_at}
        )
      `;
    }

    console.log('✅ Данные перенесены');

    // 6. Создаём индексы и ограничения
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX "spam_records_identifier_platform_key" ON "spam_records"("identifier", "platform");
    `;
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX "reports_record_id_device_id_key" ON "reports"("record_id", "device_id");
    `;
    await prisma.$executeRaw`
      ALTER TABLE "reports" ADD CONSTRAINT "reports_record_id_fkey" 
      FOREIGN KEY ("record_id") REFERENCES "spam_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `;
    await prisma.$executeRaw`
      ALTER TABLE "comments" ADD CONSTRAINT "comments_record_id_fkey" 
      FOREIGN KEY ("record_id") REFERENCES "spam_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `;
    await prisma.$executeRaw`
      ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" 
      FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `;

    console.log('✅ Индексы и ограничения созданы');
    console.log('🎉 Миграция завершена успешно!');

  } catch (error) {
    console.error('❌ Ошибка миграции:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
