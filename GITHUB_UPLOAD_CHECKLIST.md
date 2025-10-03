# 📤 GitHub上传检查清单

在上传到GitHub之前，请仔细检查以下所有项目：

## 🔒 安全检查（最重要！）

### ✅ 必须完成的检查：

- [ ] **检查没有API密钥在代码中**
  ```bash
  grep -r "sk-" . --exclude-dir=node_modules
  grep -r "API_KEY" . --exclude-dir=node_modules | grep -v ".example"
  ```

- [ ] **确认.env文件被忽略**
  ```bash
  git status  # 确保.env不在待提交列表中
  cat .gitignore | grep .env  # 应该包含.env
  ```

- [ ] **检查没有数据库文件**
  ```bash
  find . -name "*.db" -o -name "*.sqlite"
  # 这些应该都被.gitignore忽略
  ```

- [ ] **检查没有敏感日志**
  ```bash
  find . -name "*.log" | head -5
  # 应该被.gitignore忽略
  ```

- [ ] **删除所有node_modules**
  ```bash
  find . -name "node_modules" -type d
  # 应该被.gitignore忽略
  ```

## 📝 文件准备检查

- [ ] **README.md 完整**
  - [ ] 项目描述清晰
  - [ ] 安装说明完整
  - [ ] 使用示例明确
  - [ ] 截图或演示GIF（可选但推荐）

- [ ] **LICENSE 文件存在**
  - [ ] 已创建 (MIT License ✅)

- [ ] **.gitignore 配置正确**
  - [ ] 包含 .env
  - [ ] 包含 node_modules
  - [ ] 包含 *.db
  - [ ] 包含敏感文件模式

- [ ] **示例环境变量文件**
  - [ ] .env.example 存在
  - [ ] 不包含真实密钥
  - [ ] 所有必需变量都有说明

## 🧪 功能测试检查

- [ ] **本地测试通过**
  ```bash
  # 清理环境
  rm -rf node_modules client/node_modules
  rm -rf *.db

  # 重新安装
  npm install
  cd client && npm install && cd ..

  # 初始化数据库
  npx prisma generate
  npx prisma migrate dev

  # 测试启动
  npm run dev
  ```

- [ ] **文档链接有效**
  - [ ] README.md 中的链接可点击
  - [ ] 内部文档引用正确

## 🎨 GitHub专属文件

- [ ] **.github/workflows/ci.yml** - CI/CD配置 ✅
- [ ] **.github/ISSUE_TEMPLATE/** - Issue模板 ✅
- [ ] **.github/pull_request_template.md** - PR模板 ✅
- [ ] **CONTRIBUTING.md** - 贡献指南 ✅
- [ ] **SECURITY.md** - 安全政策 ✅

## 📋 最终检查

- [ ] **删除测试数据**
  ```bash
  rm -f *.db dev.db prisma/dev.db
  rm -rf data/
  ```

- [ ] **清理临时文件**
  ```bash
  find . -name ".DS_Store" -delete
  find . -name "*.log" -delete
  ```

- [ ] **package-lock.json处理**
  - 选项A: 保留（推荐，确保依赖版本一致）
  - 选项B: 删除并在.gitignore中忽略

## 🚀 Git初始化步骤

### 1. 初始化Git仓库
```bash
cd /Users/lizhanbing12/skill-learn/ai-learning-assistant

# 如果还没初始化
git init

# 检查当前状态
git status
```

### 2. 检查要提交的文件
```bash
# 查看将被忽略的文件
git status --ignored

# 查看将被提交的文件
git status
```

### 3. 添加文件到Git
```bash
# 添加所有文件
git add .

# 再次检查状态
git status

# 确保.env不在列表中！
```

### 4. 提交
```bash
git commit -m "feat: initial commit - AI Learning Assistant MVP"
```

### 5. 在GitHub上创建仓库
1. 访问 https://github.com/new
2. 仓库名: `ai-learning-assistant`
3. 描述: `AI-powered learning companion that reduces learning friction and builds sustainable habits`
4. 选择: Public 或 Private
5. **不要**勾选 "Add README" (我们已经有了)
6. **不要**勾选 "Add .gitignore" (我们已经有了)
7. **不要**勾选 "Choose a license" (我们已经有了)
8. 点击 "Create repository"

### 6. 推送到GitHub
```bash
# 添加远程仓库 (替换YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/ai-learning-assistant.git

# 推送到main分支
git branch -M main
git push -u origin main
```

## ⚠️ 常见陷阱警告

### 🚨 绝对不能上传的内容：
1. ❌ `.env` 文件 - 包含API密钥
2. ❌ `*.db` 文件 - 可能包含用户数据
3. ❌ `node_modules/` - 太大且不必要
4. ❌ 真实的API密钥、密码、token
5. ❌ 包含个人信息的日志文件

### 如果不小心上传了敏感信息：

```bash
# 立即从历史中删除
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 强制推送
git push origin --force --all

# 然后立即：
# 1. 撤销泄露的API密钥
# 2. 生成新密钥
# 3. 更新本地.env
```

**更安全的方法：使用 BFG Repo-Cleaner**
```bash
# 安装BFG
brew install bfg  # macOS

# 删除敏感文件
bfg --delete-files .env
bfg --replace-text passwords.txt  # 替换密码文本

# 清理
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

## 📊 推送前最终确认

```bash
# 再次检查.env不会被上传
git ls-files | grep .env
# 应该只显示 .env.example

# 检查数据库文件
git ls-files | grep .db
# 应该没有输出

# 检查敏感关键词
git grep -i "api_key" -- '*.js' '*.jsx' | grep -v "process.env"
# 应该没有硬编码的密钥
```

## ✅ 上传后的检查

- [ ] GitHub仓库可访问
- [ ] README.md正确显示
- [ ] .gitignore生效（node_modules不可见）
- [ ] LICENSE文件显示
- [ ] 没有.env文件在仓库中
- [ ] Actions tab中CI/CD运行（如果配置了）

## 🎯 推荐的仓库设置

### Settings -> General
- [ ] 启用Issues
- [ ] 启用Discussions (可选，用于社区讨论)
- [ ] 禁用Wiki (我们有完整的Markdown文档)

### Settings -> Branches
- [ ] 设置main为默认分支
- [ ] 添加分支保护规则（可选）:
  - 要求PR review
  - 要求CI通过

### Settings -> Secrets
如果使用GitHub Actions:
- [ ] 添加 `OPENAI_API_KEY` (用于CI测试)

## 📱 README徽章（可选美化）

在README.md顶部添加：
```markdown
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![License](https://img.shields.io/badge/license-MIT-blue)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)
```

## 🎉 完成！

一旦所有检查都通过，你就可以安全地上传了！

**记住黄金法则：怀疑时，不要推送。检查两次，推送一次。** 🔐

---

## 📞 需要帮助？

- 遇到问题？查看 [Git文档](https://git-scm.com/doc)
- GitHub指南：[GitHub Docs](https://docs.github.com)
- 安全问题？参考 SECURITY.md
