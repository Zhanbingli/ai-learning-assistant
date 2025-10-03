# AI Learning Assistant 🤖📚

An intelligent learning companion that helps you:
- 📅 **Create personalized learning plans** across any subject
- 🎯 **Reduce learning friction** with AI-guided micro-tasks
- 📊 **Track progress intelligently** with adaptive monitoring
- 💪 **Build sustainable habits** through gamification
- 🚀 **Showcase your achievements** with portfolio integration

## ✨ Core Features

### 1. AI-Powered Planning
- Generate custom learning roadmaps based on your goals, time, and background
- Support for programming, languages, mathematics, design, and more
- Multi-model AI integration (OpenAI, Claude, Gemini, local models)

### 2. Smart Supervision
- **Pomodoro Timer** - Deep work tracking
- **Task Decomposition** - AI breaks large tasks into 20-min chunks
- **Procrastination Detection** - Identifies blockers and suggests solutions
- **Adaptive Reminders** - Context-aware nudges when you drift off course

### 3. Gamification & Motivation
- **Achievement System** - Unlock badges for consistency and milestones
- **Learning Curves** - Multi-dimensional progress visualization
- **AI Encouragement** - Personalized motivation based on your state
- **Streak Tracking** - Build momentum with daily consistency

### 4. Multi-Subject Support
- Pre-built templates for popular subjects
- Custom template creator
- Cross-discipline progress tracking
- Integration with learning resources (videos, books, practice platforms)

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd ai-learning-assistant

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your AI API keys

# Initialize database
npm run db:migrate

# Start development server
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 🏗️ Project Structure

```
ai-learning-assistant/
├── server/                  # Backend (Express + Prisma)
│   ├── index.js            # Entry point
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   │   ├── ai/            # AI service layer
│   │   ├── learning/      # Learning plan logic
│   │   └── analytics/     # Progress analysis
│   └── middleware/         # Express middleware
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Route pages
│   │   ├── stores/        # Zustand stores
│   │   └── services/      # API clients
│   └── public/
├── prisma/                 # Database schema
│   └── schema.prisma
└── templates/              # Subject templates
    ├── programming/
    ├── languages/
    └── math/
```

## 🤖 AI Provider Configuration

### OpenAI
```env
OPENAI_API_KEY=sk-...
DEFAULT_AI_PROVIDER=openai
DEFAULT_MODEL=gpt-4-turbo-preview
```

### Anthropic Claude
```env
ANTHROPIC_API_KEY=sk-ant-...
DEFAULT_AI_PROVIDER=anthropic
DEFAULT_MODEL=claude-3-opus-20240229
```

### Google Gemini
```env
GOOGLE_API_KEY=...
DEFAULT_AI_PROVIDER=google
DEFAULT_MODEL=gemini-pro
```

### Local Ollama
```bash
# Install Ollama: https://ollama.ai
ollama pull llama2
```
```env
OLLAMA_BASE_URL=http://localhost:11434
DEFAULT_AI_PROVIDER=ollama
DEFAULT_MODEL=llama2
```

## 📚 API Documentation

### Learning Plans
- `POST /api/plans/generate` - Generate learning plan with AI
- `GET /api/plans/:id` - Get plan details
- `PUT /api/plans/:id` - Update plan
- `DELETE /api/plans/:id` - Delete plan

### Tasks
- `GET /api/tasks` - List tasks with filters
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task status
- `DELETE /api/tasks/:id` - Delete task

### AI Assistant
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/analyze-progress` - Get progress insights
- `POST /api/ai/suggest-next-action` - Get next action suggestion

### Analytics
- `GET /api/analytics/overview` - Dashboard statistics
- `GET /api/analytics/streaks` - Streak data
- `GET /api/analytics/time-tracking` - Time spent analysis

## 🎯 Roadmap

- [x] Core architecture setup
- [x] Multi-AI provider integration
- [ ] Learning plan generator
- [ ] Task management system
- [ ] Pomodoro timer
- [ ] Progress visualization
- [ ] Achievement system
- [ ] Template marketplace
- [ ] Mobile app (React Native)
- [ ] Social features (optional)

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ to make learning enjoyable and sustainable**
