import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/plans
 * List all learning plans for a user
 */
router.get('/', async (req, res, next) => {
  try {
    const { userId, status } = req.query;

    const where = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const plans = await prisma.learningPlan.findMany({
      where,
      include: {
        milestones: {
          include: {
            tasks: true
          }
        },
        _count: {
          select: { tasks: true, milestones: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, plans });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/plans/:id
 * Get a specific learning plan
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const plan = await prisma.learningPlan.findUnique({
      where: { id },
      include: {
        milestones: {
          include: {
            tasks: true
          },
          orderBy: { order: 'asc' }
        },
        user: {
          select: { id: true, name: true }
        }
      }
    });

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json({ success: true, plan });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/plans
 * Create a new learning plan
 */
router.post('/', async (req, res, next) => {
  try {
    const {
      userId,
      title,
      subject,
      description,
      difficulty,
      aiGenerated,
      templateId,
      startDate,
      targetEndDate,
      estimatedHours,
      userContext,
      milestones
    } = req.body;

    if (!userId || !title || !subject) {
      return res.status(400).json({
        error: 'userId, title, and subject are required'
      });
    }

    const plan = await prisma.learningPlan.create({
      data: {
        userId,
        title,
        subject,
        description,
        difficulty: difficulty || 'beginner',
        aiGenerated: aiGenerated || false,
        templateId,
        startDate: startDate ? new Date(startDate) : null,
        targetEndDate: targetEndDate ? new Date(targetEndDate) : null,
        estimatedHours,
        userContext,
        milestones: {
          create: milestones?.map((m, index) => ({
            title: m.title,
            description: m.description,
            order: m.order || index,
            targetDate: m.targetDate ? new Date(m.targetDate) : null,
            tasks: {
              create: m.tasks?.map(task => ({
                userId,
                title: task.title,
                description: task.description,
                type: task.type || 'practice',
                estimatedMinutes: task.estimatedMinutes,
                difficulty: task.difficulty,
                resources: task.resources,
                aiSuggested: aiGenerated || false
              })) || []
            }
          })) || []
        }
      },
      include: {
        milestones: {
          include: { tasks: true }
        }
      }
    });

    res.status(201).json({ success: true, plan });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/plans/:id
 * Update a learning plan
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be directly updated
    delete updates.id;
    delete updates.userId;
    delete updates.createdAt;
    delete updates.milestones;
    delete updates.tasks;

    const plan = await prisma.learningPlan.update({
      where: { id },
      data: updates,
      include: {
        milestones: {
          include: { tasks: true }
        }
      }
    });

    res.json({ success: true, plan });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Plan not found' });
    }
    next(error);
  }
});

/**
 * DELETE /api/plans/:id
 * Delete a learning plan
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.learningPlan.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Plan deleted' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Plan not found' });
    }
    next(error);
  }
});

export default router;
