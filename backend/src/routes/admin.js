const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { requireAdminAuth, requireRole, generateToken } = require('../middleware/adminAuth');

const router = express.Router();
const prisma = new PrismaClient();

// ============ AUTH ============

// POST /api/admin/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const adminUser = await prisma.adminUser.findUnique({
      where: { username }
    });

    if (!adminUser) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, adminUser.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { lastLoginAt: new Date() }
    });

    const token = generateToken(adminUser);

    res.json({
      token,
      user: {
        id: adminUser.id,
        username: adminUser.username,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/admin/auth/me
router.get('/auth/me', requireAdminAuth, async (req, res) => {
  try {
    const adminUser = await prisma.adminUser.findUnique({
      where: { id: req.adminUser.id },
      select: { id: true, username: true, role: true, createdAt: true, lastLoginAt: true }
    });

    if (!adminUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(adminUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

// ============ ANALYTICS ============

// GET /api/admin/analytics/summary
router.get('/analytics/summary', requireAdminAuth, async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFilter = {};
    
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);

    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalReports,
      reportsToday,
      reportsWeek,
      reportsMonth,
      totalRecords,
      recordsToday,
      totalComments,
      reportsByPlatform,
      reportsByCategory,
      topIdentifiers
    ] = await Promise.all([
      prisma.report.count({ where: { deletedAt: null } }),
      prisma.report.count({ where: { createdAt: { gte: dayAgo }, deletedAt: null } }),
      prisma.report.count({ where: { createdAt: { gte: weekAgo }, deletedAt: null } }),
      prisma.report.count({ where: { createdAt: { gte: monthAgo }, deletedAt: null } }),
      prisma.spamRecord.count({ where: { hiddenAt: null } }),
      prisma.spamRecord.count({ where: { createdAt: { gte: dayAgo }, hiddenAt: null } }),
      prisma.comment.count({ where: { deletedAt: null } }),
      prisma.spamRecord.groupBy({
        by: ['platform'],
        _count: { id: true },
        where: { hiddenAt: null }
      }),
      prisma.spamRecord.groupBy({
        by: ['category'],
        _count: { id: true },
        where: { hiddenAt: null }
      }),
      prisma.spamRecord.findMany({
        where: { hiddenAt: null },
        orderBy: { reportsCount: 'desc' },
        take: 10,
        select: { identifier: true, platform: true, reportsCount: true, category: true }
      })
    ]);

    res.json({
      reports: {
        total: totalReports,
        today: reportsToday,
        week: reportsWeek,
        month: reportsMonth
      },
      records: {
        total: totalRecords,
        today: recordsToday
      },
      comments: {
        total: totalComments
      },
      byPlatform: reportsByPlatform.map(p => ({ platform: p.platform, count: p._count.id })),
      byCategory: reportsByCategory.map(c => ({ category: c.category, count: c._count.id })),
      topIdentifiers
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// ============ REPORTS ============

// GET /api/admin/reports
router.get('/reports', requireAdminAuth, async (req, res) => {
  try {
    const { 
      platform, category, identifier, recordId, deviceId, ipAddress,
      from, to, isValid, includeDeleted,
      page = 1, pageSize = 20, sortBy = 'createdAt', sortOrder = 'desc' 
    } = req.query;

    const where = {};
    
    if (!includeDeleted || includeDeleted !== 'true') {
      where.deletedAt = null;
    }
    
    if (category) where.category = category;
    if (recordId) where.recordId = recordId;
    if (deviceId) where.deviceId = { contains: deviceId };
    if (ipAddress) where.ipAddress = { contains: ipAddress };
    if (isValid !== undefined) where.isValid = isValid === 'true';
    
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    // Filter by record properties
    if (platform || identifier) {
      where.record = {};
      if (platform) where.record.platform = platform;
      if (identifier) where.record.identifier = { contains: identifier };
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          record: {
            select: { identifier: true, platform: true, status: true, category: true, reportsCount: true }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (parseInt(page) - 1) * parseInt(pageSize),
        take: parseInt(pageSize)
      }),
      prisma.report.count({ where })
    ]);

    res.json({
      data: reports,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total,
        totalPages: Math.ceil(total / parseInt(pageSize))
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

// PATCH /api/admin/reports/:id
router.patch('/reports/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isValid } = req.body;

    const report = await prisma.report.update({
      where: { id },
      data: { isValid },
      include: { record: true }
    });

    // Log action
    await prisma.moderationLog.create({
      data: {
        adminUserId: req.adminUser.id,
        actionType: 'UPDATE_REPORT',
        entityType: 'Report',
        entityId: id,
        payload: { isValid }
      }
    });

    res.json(report);
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// DELETE /api/admin/reports/:id (soft delete)
router.delete('/reports/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const report = await prisma.report.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    // Log action
    await prisma.moderationLog.create({
      data: {
        adminUserId: req.adminUser.id,
        actionType: 'DELETE_REPORT',
        entityType: 'Report',
        entityId: id,
        payload: {}
      }
    });

    res.json({ success: true, report });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

// POST /api/admin/reports/:id/restore
router.post('/reports/:id/restore', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const report = await prisma.report.update({
      where: { id },
      data: { deletedAt: null }
    });

    await prisma.moderationLog.create({
      data: {
        adminUserId: req.adminUser.id,
        actionType: 'RESTORE_REPORT',
        entityType: 'Report',
        entityId: id,
        payload: {}
      }
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to restore report' });
  }
});

// ============ RECORDS ============

// GET /api/admin/records
router.get('/records', requireAdminAuth, async (req, res) => {
  try {
    const { 
      platform, category, status, identifier, includeHidden,
      page = 1, pageSize = 20, sortBy = 'createdAt', sortOrder = 'desc' 
    } = req.query;

    const where = {};
    
    if (!includeHidden || includeHidden !== 'true') {
      where.hiddenAt = null;
    }
    
    if (platform) where.platform = platform;
    if (category) where.category = category;
    if (status) where.status = status;
    if (identifier) where.identifier = { contains: identifier };

    const [records, total] = await Promise.all([
      prisma.spamRecord.findMany({
        where,
        include: {
          _count: { select: { reports: true, comments: true } }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (parseInt(page) - 1) * parseInt(pageSize),
        take: parseInt(pageSize)
      }),
      prisma.spamRecord.count({ where })
    ]);

    res.json({
      data: records,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total,
        totalPages: Math.ceil(total / parseInt(pageSize))
      }
    });
  } catch (error) {
    console.error('Get records error:', error);
    res.status(500).json({ error: 'Failed to get records' });
  }
});

// GET /api/admin/records/:id
router.get('/records/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const record = await prisma.spamRecord.findUnique({
      where: { id },
      include: {
        reports: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
        comments: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } }
      }
    });

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get record' });
  }
});

// PATCH /api/admin/records/:id
router.patch('/records/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, category, hiddenAt } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (category) updateData.category = category;
    if (hiddenAt !== undefined) updateData.hiddenAt = hiddenAt ? new Date() : null;

    const record = await prisma.spamRecord.update({
      where: { id },
      data: updateData
    });

    await prisma.moderationLog.create({
      data: {
        adminUserId: req.adminUser.id,
        actionType: 'UPDATE_RECORD',
        entityType: 'SpamRecord',
        entityId: id,
        payload: updateData
      }
    });

    res.json(record);
  } catch (error) {
    console.error('Update record error:', error);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// DELETE /api/admin/records/:id (soft delete - скрываем запись)
router.delete('/records/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const record = await prisma.spamRecord.update({
      where: { id },
      data: { hiddenAt: new Date() }
    });

    await prisma.moderationLog.create({
      data: {
        adminUserId: req.adminUser.id,
        actionType: 'DELETE_RECORD',
        entityType: 'SpamRecord',
        entityId: id,
        payload: {}
      }
    });

    res.json({ success: true, record });
  } catch (error) {
    console.error('Delete record error:', error);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

// POST /api/admin/records/:id/restore (восстановление записи)
router.post('/records/:id/restore', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const record = await prisma.spamRecord.update({
      where: { id },
      data: { hiddenAt: null }
    });

    await prisma.moderationLog.create({
      data: {
        adminUserId: req.adminUser.id,
        actionType: 'RESTORE_RECORD',
        entityType: 'SpamRecord',
        entityId: id,
        payload: {}
      }
    });

    res.json(record);
  } catch (error) {
    console.error('Restore record error:', error);
    res.status(500).json({ error: 'Failed to restore record' });
  }
});

// ============ COMMENTS ============

// GET /api/admin/comments
router.get('/comments', requireAdminAuth, async (req, res) => {
  try {
    const { 
      recordId, identifier, author, includeDeleted,
      from, to,
      page = 1, pageSize = 20, sortBy = 'createdAt', sortOrder = 'desc' 
    } = req.query;

    const where = {};
    
    if (!includeDeleted || includeDeleted !== 'true') {
      where.deletedAt = null;
    }
    
    if (recordId) where.recordId = recordId;
    if (author) where.author = { contains: author };
    
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    if (identifier) {
      where.record = { identifier: { contains: identifier } };
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          record: { select: { identifier: true, platform: true } }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (parseInt(page) - 1) * parseInt(pageSize),
        take: parseInt(pageSize)
      }),
      prisma.comment.count({ where })
    ]);

    res.json({
      data: comments,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total,
        totalPages: Math.ceil(total / parseInt(pageSize))
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to get comments' });
  }
});

// DELETE /api/admin/comments/:id (soft delete)
router.delete('/comments/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await prisma.comment.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await prisma.moderationLog.create({
      data: {
        adminUserId: req.adminUser.id,
        actionType: 'DELETE_COMMENT',
        entityType: 'Comment',
        entityId: id,
        payload: {}
      }
    });

    res.json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// POST /api/admin/comments/:id/restore
router.post('/comments/:id/restore', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await prisma.comment.update({
      where: { id },
      data: { deletedAt: null }
    });

    await prisma.moderationLog.create({
      data: {
        adminUserId: req.adminUser.id,
        actionType: 'RESTORE_COMMENT',
        entityType: 'Comment',
        entityId: id,
        payload: {}
      }
    });

    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to restore comment' });
  }
});

// ============ AUDIT LOGS ============

// GET /api/admin/audit-logs
router.get('/audit-logs', requireAdminAuth, requireRole('admin'), async (req, res) => {
  try {
    const { 
      adminUserId, actionType, entityType,
      from, to,
      page = 1, pageSize = 50 
    } = req.query;

    const where = {};
    
    if (adminUserId) where.adminUserId = adminUserId;
    if (actionType) where.actionType = actionType;
    if (entityType) where.entityType = entityType;
    
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [logs, total] = await Promise.all([
      prisma.moderationLog.findMany({
        where,
        include: {
          adminUser: { select: { username: true, role: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(pageSize),
        take: parseInt(pageSize)
      }),
      prisma.moderationLog.count({ where })
    ]);

    res.json({
      data: logs,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total,
        totalPages: Math.ceil(total / parseInt(pageSize))
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to get audit logs' });
  }
});

// ============ ADMIN USERS (admin only) ============

// GET /api/admin/users
router.get('/users', requireAdminAuth, requireRole('admin'), async (req, res) => {
  try {
    const users = await prisma.adminUser.findMany({
      select: { id: true, username: true, role: true, createdAt: true, lastLoginAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// POST /api/admin/users
router.post('/users', requireAdminAuth, requireRole('admin'), async (req, res) => {
  try {
    const { username, password, role = 'moderator' } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const existing = await prisma.adminUser.findUnique({ where: { username } });
    if (existing) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.adminUser.create({
      data: { username, passwordHash, role },
      select: { id: true, username: true, role: true, createdAt: true }
    });

    await prisma.moderationLog.create({
      data: {
        adminUserId: req.adminUser.id,
        actionType: 'CREATE_ADMIN_USER',
        entityType: 'AdminUser',
        entityId: user.id,
        payload: { username, role }
      }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', requireAdminAuth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.adminUser.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    await prisma.adminUser.delete({ where: { id } });

    await prisma.moderationLog.create({
      data: {
        adminUserId: req.adminUser.id,
        actionType: 'DELETE_ADMIN_USER',
        entityType: 'AdminUser',
        entityId: id,
        payload: {}
      }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
