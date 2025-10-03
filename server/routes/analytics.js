import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/analytics/overview
 * Get dashboard overview statistics
 */
router.get('/overview', async (req, res, next) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const [
      totalPlans,
      activePlans,
      totalTasks,
      completedTasks,
      totalSessions,
      recentSessions
    ] = await Promise.all([
      prisma.learningPlan.count({ where: { userId } }),
      prisma.learningPlan.count({ where: { userId, status: 'active' } }),
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: 'completed' } }),
      prisma.studySession.count({ where: { userId } }),
      prisma.studySession.findMany({
        where: { userId },
        orderBy: { startTime: 'desc' },
        take: 7,
        select: { startTime: true, durationMinutes: true }
      })
    ]);

    const totalMinutes = await prisma.studySession.aggregate({
      where: { userId },
      _sum: { durationMinutes: true }
    });

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    res.json({
      success: true,
      overview: {
        totalPlans,
        activePlans,
        totalTasks,
        completedTasks,
        completionRate: Math.round(completionRate),
        totalSessions,
        totalMinutes: totalMinutes._sum.durationMinutes || 0,
        recentActivity: recentSessions
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/streaks
 * Calculate learning streaks
 */
router.get('/streaks', async (req, res, next) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const sessions = await prisma.studySession.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      select: { startTime: true }
    });

    const dates = sessions
      .map(s => new Date(s.startTime).toDateString())
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => new Date(b) - new Date(a));

    let currentStreak = 0;
    let longestStreak = 0;

    if (dates.length > 0) {
      const today = new Date().toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (dates[0] === today || dates[0] === yesterday.toDateString()) {
        currentStreak = 1;

        for (let i = 1; i < dates.length; i++) {
          const current = new Date(dates[i]);
          const previous = new Date(dates[i - 1]);
          const diffDays = Math.floor((previous - current) / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      // Calculate longest streak
      let tempStreak = 1;
      for (let i = 1; i < dates.length; i++) {
        const current = new Date(dates[i]);
        const previous = new Date(dates[i - 1]);
        const diffDays = Math.floor((previous - current) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, currentStreak);
    }

    res.json({
      success: true,
      streaks: {
        current: currentStreak,
        longest: longestStreak,
        totalDays: dates.length
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/time-tracking
 * Get time tracking analytics
 */
router.get('/time-tracking', async (req, res, next) => {
  try {
    const { userId, days = 30 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const sessions = await prisma.studySession.findMany({
      where: {
        userId,
        startTime: { gte: startDate }
      },
      select: {
        startTime: true,
        durationMinutes: true,
        type: true
      },
      orderBy: { startTime: 'asc' }
    });

    // Group by day
    const dailyData = {};
    sessions.forEach(session => {
      const date = new Date(session.startTime).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { date, minutes: 0, sessions: 0 };
      }
      dailyData[date].minutes += session.durationMinutes || 0;
      dailyData[date].sessions++;
    });

    const timeSeriesData = Object.values(dailyData).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    res.json({
      success: true,
      timeTracking: {
        dailyData: timeSeriesData,
        totalMinutes: sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0),
        totalSessions: sessions.length,
        averagePerDay: timeSeriesData.length > 0
          ? Math.round(
              timeSeriesData.reduce((sum, d) => sum + d.minutes, 0) / timeSeriesData.length
            )
          : 0
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
