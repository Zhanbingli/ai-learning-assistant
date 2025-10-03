# AI Learning Assistant - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- npm or pnpm
- Git

### Local Development

1. **Clone the repository**
   ```bash
   cd ai-learning-assistant
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install client dependencies
   cd client && npm install && cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your AI API keys:
   ```env
   # Choose at least one AI provider
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...
   GOOGLE_API_KEY=...

   # Set default provider
   DEFAULT_AI_PROVIDER=openai
   DEFAULT_MODEL=gpt-4-turbo-preview
   ```

4. **Initialize the database**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend API: http://localhost:3001
   - Frontend: http://localhost:5173

6. **Optional: Seed demo data**
   ```bash
   node server/scripts/seed.js
   ```

---

## 🐳 Docker Deployment

### Option 1: Docker Compose (Recommended)

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Option 2: Docker Build

```bash
# Build image
docker build -t ai-learning-assistant .

# Run container
docker run -d \
  -p 3001:3001 \
  -e OPENAI_API_KEY=your-key \
  -v $(pwd)/data:/app/data \
  --name learning-assistant \
  ai-learning-assistant
```

---

## 🤖 AI Provider Configuration

### OpenAI (Recommended for beginners)
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

### Local Ollama (Free, runs locally)
```bash
# Install Ollama: https://ollama.ai
ollama pull llama2

# Configure
OLLAMA_BASE_URL=http://localhost:11434
DEFAULT_AI_PROVIDER=ollama
DEFAULT_MODEL=llama2
```

---

## 📊 Database Management

### View database with Prisma Studio
```bash
npm run db:studio
```

### Reset database
```bash
npx prisma migrate reset
```

### Create migration
```bash
npx prisma migrate dev --name your_migration_name
```

---

## 🧪 Testing

### Run backend tests
```bash
cd server && npm test
```

### Run frontend tests
```bash
cd client && npm test
```

---

## 🛠️ Troubleshooting

### "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### Frontend not loading
- Check that both servers are running (`npm run dev`)
- Verify ports 3001 and 5173 are available
- Clear browser cache

### AI API errors
- Verify API keys are correct in `.env`
- Check API provider status
- Ensure you have credits/quota remaining

### Database issues
```bash
# Reset and recreate database
npx prisma migrate reset
npx prisma migrate dev
```

---

## 📁 Project Structure

```
ai-learning-assistant/
├── server/                 # Backend
│   ├── index.js           # Express server
│   ├── routes/            # API endpoints
│   └── services/          # Business logic
│       └── ai/           # AI service layer
├── client/                # Frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Route pages
│   │   └── services/     # API clients
│   └── public/
├── prisma/                # Database schema
│   └── schema.prisma
├── .env                   # Environment variables
├── Dockerfile            # Production build
└── docker-compose.yml    # Docker orchestration
```

---

## 🌐 Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SESSION_SECRET=your-strong-secret
```

### Deploy to VPS
```bash
# SSH to server
ssh user@your-server.com

# Clone repo
git clone <repo-url>
cd ai-learning-assistant

# Set up environment
cp .env.example .env
nano .env  # Edit with production values

# Run with Docker
docker-compose up -d

# Set up Nginx reverse proxy (optional)
sudo apt install nginx
# Configure Nginx to proxy port 3001
```

### Deploy to Cloud Platforms

#### Vercel (Frontend + Serverless)
- Connect GitHub repository
- Set environment variables in dashboard
- Deploy automatically on push

#### Railway/Render (Full Stack)
- Connect repository
- Set build command: `npm install && cd client && npm install && npm run build`
- Set start command: `npm start`
- Add environment variables

---

## 🔒 Security Notes

- Never commit `.env` file
- Use strong `SESSION_SECRET` in production
- Enable HTTPS in production
- Regularly update dependencies: `npm audit fix`

---

## 🆘 Getting Help

- Check [README.md](README.md) for feature documentation
- Review API routes in `server/routes/`
- Examine Prisma schema in `prisma/schema.prisma`
- Open an issue on GitHub

---

**Built with ❤️ - Happy Learning!**
