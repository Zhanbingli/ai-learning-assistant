import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/templates
 * List available templates
 */
router.get('/', async (req, res, next) => {
  try {
    const { category, difficulty } = req.query;

    const where = { isPublic: true };
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;

    const templates = await prisma.template.findMany({
      where,
      select: {
        id: true,
        name: true,
        category: true,
        difficulty: true,
        title: true,
        description: true,
        estimatedHours: true,
        downloads: true,
        rating: true
      },
      orderBy: { downloads: 'desc' }
    });

    res.json({ success: true, templates });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/templates/:id
 * Get template details
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const template = await prisma.template.findUnique({
      where: { id }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Increment downloads
    await prisma.template.update({
      where: { id },
      data: { downloads: { increment: 1 } }
    });

    res.json({ success: true, template });
  } catch (error) {
    next(error);
  }
});

export default router;
