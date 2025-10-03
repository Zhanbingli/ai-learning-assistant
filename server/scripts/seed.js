import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const user = await prisma.user.upsert({
    where: { id: 'demo-user' },
    update: {},
    create: {
      id: 'demo-user',
      name: 'Demo User',
      email: 'demo@example.com',
      preferences: {
        theme: 'light',
        notifications: true,
      },
    },
  });

  console.log('✅ Created demo user:', user.name);

  // Load Python template
  const templatePath = path.join(__dirname, '../../templates/python-basics.json');
  const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));

  // Create template
  const template = await prisma.template.upsert({
    where: { name: templateData.name },
    update: templateData,
    create: templateData,
  });

  console.log('✅ Created template:', template.title);

  // Create a learning plan from template
  const plan = await prisma.learningPlan.create({
    data: {
      userId: user.id,
      title: template.title,
      subject: template.category,
      description: template.description,
      difficulty: template.difficulty,
      estimatedHours: template.estimatedHours,
      aiGenerated: false,
      templateId: template.id,
      status: 'active',
      startDate: new Date(),
      milestones: {
        create: templateData.structure.milestones.map((milestone) => ({
          title: milestone.title,
          description: milestone.description,
          order: milestone.order,
          status: milestone.order === 1 ? 'in_progress' : 'pending',
          tasks: {
            create: milestone.tasks.map((task, index) => ({
              userId: user.id,
              title: task.title,
              description: task.description,
              type: task.type,
              estimatedMinutes: task.estimatedMinutes,
              difficulty: task.difficulty,
              resources: task.resources || [],
              status: milestone.order === 1 && index === 0 ? 'in_progress' : 'pending',
              priority: index === 0 ? 'high' : 'medium',
            })),
          },
        })),
      },
    },
  });

  console.log('✅ Created learning plan:', plan.title);

  // Create some completed tasks and sessions
  const tasks = await prisma.task.findMany({
    where: { planId: plan.id },
    take: 3,
  });

  for (const task of tasks.slice(0, 2)) {
    await prisma.task.update({
      where: { id: task.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        actualMinutes: task.estimatedMinutes,
      },
    });

    // Create study session
    await prisma.studySession.create({
      data: {
        userId: user.id,
        taskId: task.id,
        type: 'pomodoro',
        startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + task.estimatedMinutes * 60 * 1000),
        durationMinutes: task.estimatedMinutes,
        completed: true,
        focusScore: Math.floor(Math.random() * 3) + 7, // 7-10
      },
    });
  }

  console.log('✅ Created study sessions');

  // Create achievements
  await prisma.achievement.create({
    data: {
      userId: user.id,
      type: 'milestone',
      title: 'First Steps',
      description: 'Completed your first task!',
      badgeIcon: '🎯',
    },
  });

  console.log('✅ Created achievements');

  // Create some notes
  await prisma.note.create({
    data: {
      userId: user.id,
      title: 'Python Learning Notes',
      content: 'Remember to practice daily! Focus on understanding concepts rather than memorizing syntax.',
      tags: 'python,learning,tips',
    },
  });

  console.log('✅ Created notes');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\nYou can now:');
  console.log('  - Start the app: npm run dev');
  console.log('  - View database: npm run db:studio');
  console.log('  - Login as: demo@example.com');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
