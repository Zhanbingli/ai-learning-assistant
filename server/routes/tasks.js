import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/tasks
 * List tasks with filters
 */
router.get('/', async (req, res, next) => {
  try {
    const { userId, planId, status, priority } = req.query;

    const where = {};
    if (userId) where.userId = userId;
    if (planId) where.planId = planId;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        plan: { select: { title: true, subject: true } },
        milestone: { select: { title: true } }
      },
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { dueDate: 'asc' }
      ]
    });

    res.json({ success: true, tasks });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tasks
 * Create a new task
 */
router.post('/', async (req, res, next) => {
  try {
    const {
      userId,
      planId,
      milestoneId,
      title,
      description,
      type,
      estimatedMinutes,
      difficulty,
      priority,
      dueDate,
      resources
    } = req.body;

    if (!userId || !title) {
      return res.status(400).json({ error: 'userId and title are required' });
    }

    const task = await prisma.task.create({
      data: {
        userId,
        planId,
        milestoneId,
        title,
        description,
        type: type || 'practice',
        estimatedMinutes,
        difficulty,
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        resources
      }
    });

    res.status(201).json({ success: true, task });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/tasks/:id
 * Update a task
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Handle status changes
    if (updates.status === 'completed' && !updates.completedAt) {
      updates.completedAt = new Date();
    }
    if (updates.status === 'in_progress' && !updates.startedAt) {
      updates.startedAt = new Date();
    }

    delete updates.id;
    delete updates.userId;
    delete updates.createdAt;

    const task = await prisma.task.update({
      where: { id },
      data: updates
    });

    res.json({ success: true, task });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Task not found' });
    }
    next(error);
  }
});

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.task.delete({ where: { id } });

    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Task not found' });
    }
    next(error);
  }
});

export default router;
