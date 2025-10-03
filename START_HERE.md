# 🎉 Welcome to AI Learning Assistant!

## 🚀 You have 3 options to start:

### Option 1: Quick Start Script (Recommended)
```bash
./start.sh
```
This script will:
- Check Node.js version
- Install dependencies
- Set up environment
- Initialize database
- Start the application

### Option 2: Manual Setup
```bash
# 1. Install dependencies
npm install
cd client && npm install && cd ..

# 2. Configure environment
cp .env.example .env
nano .env  # Add your AI API key

# 3. Initialize database
npx prisma migrate dev --name init

# 4. (Optional) Seed demo data
node server/scripts/seed.js

# 5. Start development servers
npm run dev
```

### Option 3: Docker (For Production)
```bash
# 1. Configure environment
cp .env.example .env
nano .env  # Add your AI API key

# 2. Build and run
docker-compose up -d

# Access at http://localhost:3001
```

---

## ✅ Prerequisites

- **Node.js** >= 18 ([Download](https://nodejs.org))
- **npm** (comes with Node.js)
- **AI API Key** (at least one):
  - OpenAI: https://platform.openai.com/api-keys
  - Anthropic: https://console.anthropic.com
  - Google: https://makersuite.google.com/app/apikey
  - Ollama: https://ollama.ai (runs locally, free)

---

## 🔑 Getting an AI API Key (Free Options)

### OpenAI (Easiest)
1. Visit https://platform.openai.com/signup
2. Sign up for free account
3. Go to API Keys section
4. Create new key
5. Copy key to `.env` file

### Ollama (Free, Local)
```bash
# Install Ollama
# Visit: https://ollama.ai

# Pull a model
ollama pull llama2

# Configure in .env
OLLAMA_BASE_URL=http://localhost:11434
DEFAULT_AI_PROVIDER=ollama
DEFAULT_MODEL=llama2
```

---

## 📚 What to do after starting?

### 1. Access the Application
- Open browser: **http://localhost:5173**
- API runs on: **http://localhost:3001**

### 2. Explore Demo Data (if seeded)
- Demo user already logged in
- Sample Python learning plan loaded
- Try completing tasks
- Start a Pomodoro session

### 3. Generate Your Own Plan
1. Click **"Generate Plan"** button
2. Enter what you want to learn
3. Set your goals and availability
4. Let AI create your roadmap!

### 4. Start Learning
- Pick a task from the board
- Start Pomodoro timer
- Track your progress
- Unlock achievements!

---

## 📖 Documentation

We have comprehensive guides for you:

- **[README.md](README.md)** - Project overview and features
- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[USER_GUIDE.md](USER_GUIDE.md)** - How to use the app
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Command cheatsheet
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Technical details
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute

---

## 🆘 Troubleshooting

### "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### "Port 3001 already in use"
```bash
# Find and kill the process
lsof -i :3001
kill -9 <PID>
```

### "AI API Error"
- Check your API key in `.env`
- Verify you have credits/quota
- Try a different provider

### "Database errors"
```bash
# Reset database
npx prisma migrate reset
npx prisma migrate dev
```

---

## 🎯 First Steps Checklist

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured with API key
- [ ] Database initialized
- [ ] Development server running
- [ ] Opened http://localhost:5173 in browser
- [ ] Generated first learning plan
- [ ] Started first Pomodoro session

---

## 💡 Pro Tips

1. **Start Small**: Generate a plan for something you're already learning
2. **Use Templates**: Browse templates for inspiration
3. **Daily Habit**: Commit to just 25 minutes (1 Pomodoro) daily
4. **Track Everything**: The more you log, the better AI suggestions
5. **Celebrate Wins**: Check your achievements regularly!

---

## 🌟 What Makes This Special?

Unlike traditional todo apps, this AI assistant:
- **Generates personalized learning roadmaps** based on your context
- **Adapts to your pace** with AI-powered insights
- **Reduces decision fatigue** with "next action" suggestions
- **Builds habits** through gamification and streaks
- **Works for any subject** - not just programming!

---

## 🚀 You're Ready!

Choose your option above and start your learning journey!

**Remember**: Consistency beats intensity. Even 20 minutes a day builds momentum.

Questions? Check the docs or open an issue on GitHub.

**Happy Learning!** 📚✨🎓

---

**Quick Links:**
- Frontend: http://localhost:5173
- API: http://localhost:3001
- Database Studio: `npm run db:studio`
- Documentation: All *.md files in root
