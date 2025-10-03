import express from 'express';
import aiService from '../services/ai/AIService.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/ai/chat
 * General chat with AI assistant
 */
router.post('/chat', async (req, res, next) => {
  try {
    const { messages, provider, model } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const response = await aiService.chat(messages, { provider, model });

    // Save conversation (optional)
    if (req.body.userId) {
      await prisma.aIConversation.create({
        data: {
          userId: req.body.userId,
          provider: provider || process.env.DEFAULT_AI_PROVIDER,
          model: model || process.env.DEFAULT_MODEL,
          messages: messages,
          purpose: req.body.purpose || 'chat'
        }
      });
    }

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/generate-plan
 * Generate a learning plan based on user context
 */
router.post('/generate-plan', async (req, res, next) => {
  try {
    const userContext = req.body;

    // Validate required fields
    if (!userContext.subject || !userContext.goal) {
      return res.status(400).json({
        error: 'Subject and goal are required'
      });
    }

    const plan = await aiService.generateLearningPlan(userContext);

    res.json({
      success: true,
      plan,
      metadata: {
        generatedAt: new Date().toISOString(),
        provider: process.env.DEFAULT_AI_PROVIDER
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/analyze-progress
 * Analyze user's learning progress
 */
router.post('/analyze-progress', async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Gather progress data
    const [completedTasks, pendingTasks, sessions, blockedTasks] = await Promise.all([
      prisma.task.count({ where: { userId, status: 'completed' } }),
      prisma.task.count({ where: { userId, status: 'pending' } }),
      prisma.studySession.findMany({
        where: { userId },
        orderBy: { startTime: 'desc' },
        take: 10
      }),
      prisma.task.findMany({
        where: { userId, status: 'blocked' },
        select: { title: true, blockerReason: true }
      })
    ]);

    // Calculate streak
    const recentSessions = await prisma.studySession.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      select: { startTime: true }
    });

    const streak = calculateStreak(recentSessions.map(s => s.startTime));

    const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

    const progressData = {
      completedTasks,
      pendingTasks,
      streak,
      totalMinutes,
      blockers: blockedTasks.map(t => ({
        task: t.title,
        reason: t.blockerReason
      }))
    };

    const analysis = await aiService.analyzeProgress(progressData);

    res.json({
      success: true,
      progressData,
      analysis
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/suggest-next-action
 * Get AI suggestion for next best action
 */
router.post('/suggest-next-action', async (req, res, next) => {
  try {
    const { userId, energyLevel, availableMinutes } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Get current context
    const [currentTask, recentSessions, blockedTasks] = await Promise.all([
      prisma.task.findFirst({
        where: { userId, status: 'in_progress' },
        select: { title: true, description: true }
      }),
      prisma.studySession.findMany({
        where: { userId },
        orderBy: { startTime: 'desc' },
        take: 5
      }),
      prisma.task.count({ where: { userId, status: 'blocked' } })
    ]);

    const context = {
      currentTask: currentTask?.title,
      energyLevel: energyLevel || 'medium',
      availableMinutes: availableMinutes || 30,
      recentProgress: recentSessions.length > 0 ? 'active' : 'inactive',
      blockers: blockedTasks > 0 ? `${blockedTasks} blocked tasks` : 'none'
    };

    const suggestion = await aiService.suggestNextAction(context);

    res.json({
      success: true,
      suggestion,
      context
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Helper: Calculate learning streak
 */
function calculateStreak(dates) {
  if (dates.length === 0) return 0;

  const sortedDates = dates
    .map(d => new Date(d).toDateString())
    .filter((v, i, a) => a.indexOf(v) === i) // unique dates
    .sort((a, b) => new Date(b) - new Date(a));

  let streak = 1;
  const today = new Date().toDateString();

  if (sortedDates[0] !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (sortedDates[0] !== yesterday.toDateString()) {
      return 0; // Streak broken
    }
  }

  for (let i = 1; i < sortedDates.length; i++) {
    const current = new Date(sortedDates[i]);
    const previous = new Date(sortedDates[i - 1]);
    const diffDays = Math.floor((previous - current) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export default router;
