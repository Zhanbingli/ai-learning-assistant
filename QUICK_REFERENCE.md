# Quick Reference Card

## 🚀 Essential Commands

```bash
# Start development (both frontend + backend)
npm run dev

# Start backend only
npm run server:dev

# Start frontend only
npm run client:dev

# Initialize database
npx prisma migrate dev

# View database
npm run db:studio

# Seed demo data
node server/scripts/seed.js

# Docker deployment
docker-compose up -d
```

## 🔑 Environment Variables

```env
# Required: At least one AI provider
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...

# Default provider
DEFAULT_AI_PROVIDER=openai     # openai | anthropic | google | ollama
DEFAULT_MODEL=gpt-4-turbo-preview

# Server
PORT=3001
NODE_ENV=development           # development | production

# Database
DATABASE_URL="file:./dev.db"   # SQLite default
```

## 📍 Default URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Prisma Studio**: http://localhost:5555

## 🎯 Key Features

### Generate Learning Plan
1. Navigate to "Generate Plan"
2. Fill in: Subject, Goal, Level, Time
3. Click "Generate Learning Plan"
4. AI creates personalized roadmap

### Manage Tasks
1. Navigate to "Tasks"
2. View Kanban board (Pending/In Progress/Completed)
3. Click task to toggle status
4. Track progress automatically

### Use Pomodoro
1. Click timer icon (bottom-right)
2. Start 25-minute focus session
3. Take 5-minute break when complete
4. Sessions auto-track to analytics

### View Analytics
1. Dashboard shows overview
2. Streaks, completion rate, total hours
3. AI provides insights and suggestions

## 🗄️ Database Quick Commands

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (DANGER: deletes all data)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# Push schema changes without migration
npx prisma db push
```

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 3001 is in use
lsof -i :3001
kill -9 <PID>

# Regenerate Prisma client
npx prisma generate
```

### Frontend errors
```bash
# Clear cache and reinstall
cd client
rm -rf node_modules package-lock.json
npm install
```

### Database errors
```bash
# Reset and remigrate
npx prisma migrate reset
npx prisma migrate dev
```

### AI not working
- Check API key in `.env`
- Verify provider is spelled correctly
- Check API quota/billing
- Try different provider

## 📊 API Quick Test

```bash
# Health check
curl http://localhost:3001/health

# Create task
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo-user",
    "title": "Test Task",
    "type": "practice",
    "estimatedMinutes": 30
  }'

# List tasks
curl http://localhost:3001/api/tasks?userId=demo-user
```

## 🎨 File Locations

- **Environment**: `.env` (root)
- **Database**: `prisma/dev.db`
- **Server Code**: `server/`
- **Frontend Code**: `client/src/`
- **Templates**: `templates/`
- **Docs**: `*.md` files

## 🔐 Security Checklist

- [ ] `.env` not committed to git
- [ ] Strong SESSION_SECRET in production
- [ ] HTTPS enabled for production
- [ ] API keys kept secret
- [ ] CORS configured properly
- [ ] Input validation on all endpoints

## 📱 Browser Support

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Mobile: ⚠️ Functional, best on tablet+

## 🆘 Get Help

- **Docs**: README.md, SETUP.md, USER_GUIDE.md
- **Issues**: GitHub Issues
- **Logs**: Check terminal output
- **Debug**: `console.log()` in code

## 📌 Common File Edits

### Add new API endpoint
1. Create in `server/routes/`
2. Import in `server/index.js`
3. Use in `client/src/services/api.js`

### Add new page
1. Create in `client/src/pages/`
2. Import in `client/src/App.jsx`
3. Add to navigation

### Modify database
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name change_name`
3. Update API routes if needed

## 🎯 Production Deployment

```bash
# Build frontend
cd client && npm run build

# Set production env
export NODE_ENV=production

# Run with Docker
docker-compose up -d

# Check logs
docker-compose logs -f
```

## 📦 Update Dependencies

```bash
# Check outdated
npm outdated

# Update all
npm update

# Update specific package
npm install package@latest
```

---

**Print this for quick reference!** 📄
