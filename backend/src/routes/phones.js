const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

const REPORTS_THRESHOLD = 3;

const normalizeIdentifier = (identifier, platform) => {
  if (platform === 'phone' || platform === 'whatsapp') {
    let normalized = identifier.replace(/[^\d+]/g, '');
    // Стандартные казахстанские номера
    if (normalized.startsWith('8') && normalized.length === 11) {
      normalized = '+7' + normalized.slice(1);
    }
    if (!normalized.startsWith('+') && normalized.length === 10) {
      normalized = '+7' + normalized;
    }
    // Короткие номера (3-6 цифр) - сервисные, банки и т.д.
    // Оставляем как есть
    return normalized;
  }
  if (platform === 'instagram' || platform === 'telegram') {
    return identifier.replace('@', '').toLowerCase().trim();
  }
  return identifier.trim();
};

const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown';
};

// GET /phones/stats - реальная статистика из БД
router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalRecords, todayReports, confirmedScammers] = await Promise.all([
      prisma.spamRecord.count({
        where: { hiddenAt: null }
      }),
      prisma.report.count({
        where: { createdAt: { gte: today } }
      }),
      prisma.spamRecord.count({
        where: { 
          status: 'confirmed',
          hiddenAt: null
        }
      })
    ]);

    res.json({
      totalRecords,
      todayReports,
      confirmedScammers
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
});

router.get('/recent', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const platform = req.query.platform || 'phone';
    
    const records = await prisma.spamRecord.findMany({
      where: { 
        platform,
        hiddenAt: null, // Не показываем скрытые записи
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        comments: {
          where: { parentId: null, deletedAt: null },
          take: 3,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    res.json(records);
  } catch (error) {
    console.error('Error fetching recent records:', error);
    res.status(500).json({ error: 'Ошибка получения данных' });
  }
});

router.get('/search/:identifier', async (req, res) => {
  try {
    const platform = req.query.platform || 'phone';
    const identifier = normalizeIdentifier(req.params.identifier, platform);
    
    const record = await prisma.spamRecord.findFirst({
      where: { 
        identifier,
        platform,
        hiddenAt: null, // Не показываем скрытые записи
      },
      include: {
        comments: {
          where: { parentId: null, deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            replies: {
              orderBy: { createdAt: 'asc' },
              take: 10,
            },
          },
        },
      },
    });

    if (!record) {
      return res.json({ record: null, comments: [], found: false });
    }

    res.json({
      record,
      comments: record.comments,
      found: true,
    });
  } catch (error) {
    console.error('Error searching record:', error);
    res.status(500).json({ error: 'Ошибка поиска' });
  }
});

router.post('/report', async (req, res) => {
  try {
    const { identifier: rawIdentifier, platform = 'phone', category, description, deviceId } = req.body;
    
    if (!rawIdentifier || !deviceId) {
      return res.status(400).json({ error: 'Необходимо указать идентификатор' });
    }

    const identifier = normalizeIdentifier(rawIdentifier, platform);
    const ipAddress = getClientIp(req);
    const validCategory = ['spam', 'fraud', 'scam', 'fake'].includes(category) ? category : 'spam';

    let record = await prisma.spamRecord.findUnique({
      where: { identifier_platform: { identifier, platform } },
    });

    if (record) {
      const existingReport = await prisma.report.findUnique({
        where: {
          recordId_deviceId: {
            recordId: record.id,
            deviceId,
          },
        },
      });

      if (existingReport) {
        return res.status(400).json({ error: 'Вы уже отправляли жалобу' });
      }

      await prisma.report.create({
        data: {
          recordId: record.id,
          category: validCategory,
          description,
          deviceId,
          ipAddress,
        },
      });

      // Создаём комментарий из description, если он есть
      if (description && description.trim()) {
        await prisma.comment.create({
          data: {
            recordId: record.id,
            author: 'Пользователь',
            text: description.trim(),
            deviceId: deviceId,
          },
        });
      }

      const newReportsCount = record.reportsCount + 1;
      const newStatus = newReportsCount >= REPORTS_THRESHOLD ? 'confirmed' : 'pending';

      record = await prisma.spamRecord.update({
        where: { id: record.id },
        data: {
          reportsCount: newReportsCount,
          status: newStatus,
          category: validCategory,
        },
      });
    } else {
      record = await prisma.spamRecord.create({
        data: {
          identifier,
          platform,
          category: validCategory,
          status: 'pending',
          reportsCount: 1,
          reports: {
            create: {
              category: validCategory,
              description,
              deviceId,
              ipAddress,
            },
          },
          // Создаём комментарий из description при создании новой записи
          comments: description && description.trim() ? {
            create: {
              author: 'Пользователь',
              text: description.trim(),
              deviceId: deviceId,
            },
          } : undefined,
        },
      });
    }

    res.json(record);
  } catch (error) {
    console.error('Error reporting:', error);
    res.status(500).json({ error: 'Ошибка отправки жалобы' });
  }
});

// GET /phones/:id - получение записи по ID
router.get('/record/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const record = await prisma.spamRecord.findFirst({
      where: { 
        id,
        hiddenAt: null, // Не показываем скрытые записи
      },
      include: {
        comments: {
          where: { parentId: null, deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!record) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }

    res.json(record);
  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({ error: 'Ошибка получения записи' });
  }
});

router.get('/:recordId/comments', async (req, res) => {
  try {
    const { recordId } = req.params;
    
    const comments = await prisma.comment.findMany({
      where: { 
        recordId, 
        parentId: null,
        deletedAt: null // Фильтруем удалённые комментарии
      },
      orderBy: { createdAt: 'desc' },
      include: {
        replies: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Ошибка получения комментариев' });
  }
});

router.post('/:recordId/comments', async (req, res) => {
  try {
    const { recordId } = req.params;
    const { text, deviceId, parentId, author } = req.body;

    if (!text || !deviceId) {
      return res.status(400).json({ error: 'Необходимо указать текст комментария' });
    }

    if (text.length > 500) {
      return res.status(400).json({ error: 'Комментарий слишком длинный' });
    }

    const recordExists = await prisma.spamRecord.findUnique({
      where: { id: recordId },
    });

    if (!recordExists) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }

    const comment = await prisma.comment.create({
      data: {
        recordId,
        parentId: parentId || null,
        author: author || `Аноним_${Math.floor(Math.random() * 9999)}`,
        text,
        deviceId,
      },
      include: {
        replies: true,
      },
    });

    res.json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Ошибка добавления комментария' });
  }
});

router.post('/comments/:commentId/like', async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { likes: { increment: 1 } },
    });

    res.json(comment);
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ error: 'Ошибка' });
  }
});

module.exports = router;
