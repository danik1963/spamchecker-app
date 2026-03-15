const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const sampleRecords = [
  {
    identifier: '+79001234567',
    platform: 'phone',
    category: 'spam',
    status: 'confirmed',
    reportsCount: 15,
  },
  {
    identifier: '+79009876543',
    platform: 'phone',
    category: 'fraud',
    status: 'confirmed',
    reportsCount: 8,
  },
  {
    identifier: 'spam_account',
    platform: 'instagram',
    category: 'scam',
    status: 'pending',
    reportsCount: 5,
  },
  {
    identifier: '+79003334455',
    platform: 'whatsapp',
    category: 'fraud',
    status: 'confirmed',
    reportsCount: 25,
  },
  {
    identifier: 'fake_support',
    platform: 'telegram',
    category: 'fake',
    status: 'pending',
    reportsCount: 3,
  },
];

const sampleComments = [
  'Звонят каждый день, предлагают кредиты',
  'Представляются службой безопасности банка',
  'Автоинформатор, сразу вешают трубку',
  'Мошенники! Просили данные карты',
  'Спам-звонки по несколько раз в день',
];

async function main() {
  console.log('Seeding database...');

  // Create default admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPassword,
      role: 'admin',
    },
  });
  console.log(`Created admin user: ${admin.username} (password: admin123)`);

  // Create moderator user
  const modPassword = await bcrypt.hash('mod123', 10);
  const moderator = await prisma.adminUser.upsert({
    where: { username: 'moderator' },
    update: {},
    create: {
      username: 'moderator',
      passwordHash: modPassword,
      role: 'moderator',
    },
  });
  console.log(`Created moderator user: ${moderator.username} (password: mod123)`);

  // Create sample records
  for (const recordData of sampleRecords) {
    const record = await prisma.spamRecord.upsert({
      where: { 
        identifier_platform: {
          identifier: recordData.identifier,
          platform: recordData.platform
        }
      },
      update: recordData,
      create: recordData,
    });

    // Add a sample report
    await prisma.report.upsert({
      where: {
        recordId_deviceId: {
          recordId: record.id,
          deviceId: 'seed-device'
        }
      },
      update: {},
      create: {
        recordId: record.id,
        category: recordData.category,
        description: 'Sample report from seed',
        deviceId: 'seed-device',
        ipAddress: '127.0.0.1',
      },
    });

    // Add a sample comment
    const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
    await prisma.comment.create({
      data: {
        recordId: record.id,
        text: randomComment,
        deviceId: 'seed-device',
        author: 'Аноним',
      },
    });

    console.log(`Created record: ${record.identifier} (${record.platform})`);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
