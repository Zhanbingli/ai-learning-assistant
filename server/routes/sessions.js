import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/sessions
 * Get study sessions for a user
 */
router.get('/', async (req, res, next) => {
  try {
    const { userId, startDate, endDate } = req.query;

    const where = {};
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = new Date(startDate);
      if (endDate) where.startTime.lte = new Date(endDate);
    }

    const sessions = await prisma.studySession.findMany({
      where,
      include: {
        task: { select: { title: true, type: true } }
      },
      orderBy: { startTime: 'desc' }
    });

    res.json({ success: true, sessions });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/sessions
 * Start a new study session
 */
router.post('/', async (req, res, next) => {
  try {
    const { userId, taskId, type } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const session = await prisma.studySession.create({
      data: {
        userId,
        taskId,
        type: type || 'pomodoro',
        startTime: new Date()
      }
    });

    res.status(201).json({ success: true, session });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/sessions/:id/complete
 * Complete a study session
 */
router.patch('/:id/complete', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes, focusScore } = req.body;

    const session = await prisma.studySession.findUnique({
      where: { id }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const endTime = new Date();
    const durationMinutes = Math.floor((endTime - new Date(session.startTime)) / 60000);

    const updated = await prisma.studySession.update({
      where: { id },
      data: {
        endTime,
        durationMinutes,
        completed: true,
        notes,
        focusScore
      }
    });

    // Update task actual minutes if taskId exists
    if (session.taskId) {
      const task = await prisma.task.findUnique({
        where: { id: session.taskId },
        select: { actualMinutes: true }
      });

      await prisma.task.update({
        where: { id: session.taskId },
        data: {
          actualMinutes: (task.actualMinutes || 0) + durationMinutes
        }
      });
    }

    res.json({ success: true, session: updated });
  } catch (error) {
    next(error);
  }
});

export default router;
