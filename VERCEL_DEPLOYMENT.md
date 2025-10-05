# 🚀 Vercel部署指南

## ⚠️ 重要提示

**当前项目架构不能直接部署到Vercel！**

原因：
- ❌ Express服务器（Vercel主要支持静态+Serverless）
- ❌ SQLite数据库（Vercel无状态环境不支持文件数据库）
- ❌ 长时间运行的进程（Serverless有10秒超时）

---

## 🎯 三种部署方案

### 方案1: 混合部署（最快，推荐初学者）⭐

**架构：**
```
前端 (Vercel) ←→ 后端 (Railway) ←→ 数据库 (Supabase)
```

**优点：**
- ✅ 最小代码改动
- ✅ 30分钟内完成
- ✅ 全部免费

**步骤详见下方 👇**

---

### 方案2: 完全重构为Next.js（最优，生产推荐）

**需要：**
- 重写Express为Next.js API Routes
- 迁移数据库到Postgres
- 工作量：5-7天

**适合：**
- 想要最佳性能
- 打算长期运营
- 有时间投入

---

### 方案3: 其他平台部署（保持原架构）

**推荐平台：**
- **Railway** - 最简单，有免费额度
- **Render** - 稳定，免费层
- **Fly.io** - 性能好
- **Heroku** - 经典选择（付费）

---

## 🚀 方案1详细步骤（混合部署）

### 第一步：准备数据库（Supabase）

#### 1.1 创建Supabase项目
```bash
# 访问 https://supabase.com
# 1. 注册/登录
# 2. New Project
# 3. 项目名: ai-learning-assistant
# 4. 数据库密码: 记住它！
# 5. 区域: 选择离你最近的
```

#### 1.2 获取连接字符串
```
Settings → Database → Connection String → URI
复制类似: postgresql://postgres:[password]@[host]:5432/postgres
```

#### 1.3 更新Prisma配置
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"  // 改为postgresql
  url      = env("DATABASE_URL")
}
```

#### 1.4 迁移数据库
```bash
# 更新.env
DATABASE_URL="postgresql://postgres:你的密码@xxx.supabase.co:5432/postgres"

# 安装Postgres支持
npm install pg

# 生成迁移
npx prisma migrate dev --name init_postgres

# 推送schema
npx prisma db push
```

---

### 第二步：部署后端（Railway）

#### 2.1 创建Railway项目
```bash
# 访问 https://railway.app
# 1. 登录GitHub账号
# 2. New Project
# 3. Deploy from GitHub repo
# 4. 选择 ai-learning-assistant
```

#### 2.2 配置环境变量
在Railway Dashboard:
```
Variables → Add Variable:

DATABASE_URL = (粘贴Supabase连接字符串)
OPENAI_API_KEY = sk-你的密钥
PORT = 3001
NODE_ENV = production
SESSION_SECRET = (生成一个随机字符串)
```

#### 2.3 配置构建命令
```json
// package.json (已有，确认存在)
{
  "scripts": {
    "start": "node server/index.js",
    "build": "npx prisma generate"
  }
}
```

#### 2.4 获取后端URL
部署完成后，Railway会给你一个URL：
```
https://your-app.up.railway.app
```

---

### 第三步：部署前端（Vercel）

#### 3.1 准备前端代码
```bash
# 创建vercel.json
cat > vercel.json << 'EOF'
{
  "buildCommand": "cd client && npm install && npm run build",
  "outputDirectory": "client/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-app.up.railway.app/api/:path*"
    }
  ]
}
EOF
```

**重要：替换 `your-app.up.railway.app` 为你的Railway URL！**

#### 3.2 更新API地址
```javascript
// client/src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// 改为：
const API_BASE_URL = '/api';  // 使用相对路径，Vercel会转发
```

#### 3.3 部署到Vercel
```bash
# 方法1: CLI
npm i -g vercel
vercel

# 方法2: GitHub集成（推荐）
# 1. 访问 https://vercel.com
# 2. Import Project
# 3. 选择GitHub仓库
# 4. Framework: Vite
# 5. Root Directory: ./
# 6. Deploy
```

#### 3.4 配置环境变量（Vercel Dashboard）
```
Settings → Environment Variables:

VITE_API_URL = https://your-app.up.railway.app/api
```

---

### 第四步：配置CORS

更新后端允许跨域：

```javascript
// server/index.js
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-app.vercel.app',  // 替换为你的Vercel域名
  ],
  credentials: true
}));
```

推送更新到GitHub，Railway会自动重新部署。

---

## ✅ 完成！

访问你的应用：
- **前端**: https://your-app.vercel.app
- **后端**: https://your-app.up.railway.app
- **数据库**: Supabase Dashboard

---

## 🔧 常见问题

### Q: Railway后端无法访问
**A:** 检查：
1. Railway环境变量是否正确
2. 数据库连接字符串是否有效
3. 查看Railway Logs

### Q: Vercel前端API调用失败
**A:** 检查：
1. vercel.json中的后端URL是否正确
2. CORS配置是否包含Vercel域名
3. 浏览器Console错误信息

### Q: 数据库连接失败
**A:**
```bash
# 测试连接
npx prisma db pull

# 查看详细错误
DATABASE_URL="..." npx prisma db pull --print
```

### Q: Railway免费额度用完怎么办
**A:**
- Railway提供$5/月免费额度
- 可切换到Render（永久免费层）
- 或升级Railway Pro ($5/月)

---

## 💡 优化建议

### 性能优化
```javascript
// 1. 启用gzip压缩
// server/index.js
import compression from 'compression';
app.use(compression());

// 2. 添加缓存头
app.use(express.static('client/dist', {
  maxAge: '1d'
}));
```

### 安全增强
```javascript
// 安装helmet
npm install helmet

// server/index.js
import helmet from 'helmet';
app.use(helmet());
```

### 监控
```javascript
// 添加Sentry
npm install @sentry/node

// server/index.js
import * as Sentry from '@sentry/node';
Sentry.init({ dsn: 'your-dsn' });
```

---

## 📊 成本总结（免费方案）

| 服务 | 免费额度 | 成本 |
|------|---------|------|
| Vercel | 100GB带宽 | $0 |
| Railway | $5/月额度 | $0 |
| Supabase | 500MB数据库 + 1GB存储 | $0 |
| **总计** | - | **$0/月** ✅ |

适合：
- 个人项目
- MVP测试
- 小型应用（<1000用户）

---

## 🚀 扩展升级路径

### 当需要扩展时：
1. **Railway Pro** ($5/月) - 移除$5限制
2. **Vercel Pro** ($20/月) - 更多带宽
3. **Supabase Pro** ($25/月) - 8GB数据库

---

## 📝 替代方案：其他简单平台

### 1. Render（一站式）
```bash
# render.yaml
services:
  - type: web
    name: ai-learning-assistant
    env: node
    buildCommand: npm install && npx prisma generate
    startCommand: npm start
```

### 2. Fly.io（Docker友好）
```bash
fly launch
fly deploy
```

### 3. Digital Ocean App Platform
- 连接GitHub
- 自动检测并部署
- $5/月起

---

## 🎯 推荐选择

**对于你的项目，我推荐：**

### 🥇 方案1（混合部署）
- ✅ 最快上线
- ✅ 完全免费
- ✅ 易于管理

**时间：** 30-60分钟
**难度：** ⭐⭐☆☆☆

---

## 📞 需要帮助？

我可以帮你：
1. ✅ 创建具体的配置文件
2. ✅ 解决部署错误
3. ✅ 优化性能
4. ✅ 添加监控

告诉我你想先做什么！
