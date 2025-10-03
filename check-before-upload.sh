#!/bin/bash

# 上传前安全检查脚本
# 运行此脚本以确保没有敏感信息泄露

echo "🔍 AI Learning Assistant - GitHub上传安全检查"
echo "=============================================="
echo ""

ERRORS=0

# 检查1: API密钥泄露
echo "1️⃣  检查API密钥泄露..."
if grep -r "sk-[a-zA-Z0-9]\{20,\}" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" --exclude="*.sh" 2>/dev/null | grep -v ".example" > /dev/null; then
    echo "   ❌ 发现可疑的API密钥！"
    echo "   请检查以下文件："
    grep -r "sk-[a-zA-Z0-9]\{20,\}" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" --exclude="*.sh" 2>/dev/null | grep -v ".example"
    ERRORS=$((ERRORS + 1))
else
    echo "   ✅ 未发现API密钥泄露"
fi
echo ""

# 检查2: .env文件
echo "2️⃣  检查.env文件..."
if [ -f ".env" ]; then
    echo "   ⚠️  发现.env文件"
    if grep "^\.env$" .gitignore > /dev/null; then
        echo "   ✅ .env已在.gitignore中"
    else
        echo "   ❌ .env未在.gitignore中！"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "   ✅ 没有.env文件（或已被忽略）"
fi
echo ""

# 检查3: 数据库文件
echo "3️⃣  检查数据库文件..."
DB_FILES=$(find . -name "*.db" -o -name "*.sqlite" | grep -v node_modules)
if [ -n "$DB_FILES" ]; then
    echo "   ⚠️  发现数据库文件："
    echo "$DB_FILES"
    if grep "^\*\.db$" .gitignore > /dev/null; then
        echo "   ✅ *.db已在.gitignore中"
    else
        echo "   ❌ *.db未在.gitignore中！"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "   ✅ 没有数据库文件"
fi
echo ""

# 检查4: node_modules
echo "4️⃣  检查node_modules..."
if grep "^node_modules/$" .gitignore > /dev/null; then
    echo "   ✅ node_modules已在.gitignore中"
else
    echo "   ❌ node_modules未在.gitignore中！"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 检查5: 必需文件
echo "5️⃣  检查必需文件..."
REQUIRED_FILES=("README.md" "LICENSE" ".gitignore" "package.json")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file 存在"
    else
        echo "   ❌ $file 缺失！"
        ERRORS=$((ERRORS + 1))
    fi
done
echo ""

# 检查6: .env.example
echo "6️⃣  检查示例环境变量文件..."
if [ -f ".env.example" ]; then
    if grep -E "sk-[a-zA-Z0-9]{20,}|password.*=" .env.example | grep -v "sk-\.\.\." > /dev/null; then
        echo "   ❌ .env.example包含真实密钥！"
        ERRORS=$((ERRORS + 1))
    else
        echo "   ✅ .env.example使用占位符"
    fi
else
    echo "   ⚠️  .env.example不存在"
fi
echo ""

# 检查7: Git状态
echo "7️⃣  检查Git状态..."
if [ -d ".git" ]; then
    echo "   ✅ Git已初始化"

    # 检查是否有未忽略的敏感文件
    if git ls-files | grep "^\.env$" > /dev/null; then
        echo "   ❌ .env在Git追踪中！运行: git rm --cached .env"
        ERRORS=$((ERRORS + 1))
    else
        echo "   ✅ .env未被Git追踪"
    fi

    if git ls-files | grep "\.db$" > /dev/null; then
        echo "   ❌ 数据库文件在Git追踪中！"
        ERRORS=$((ERRORS + 1))
    else
        echo "   ✅ 数据库文件未被Git追踪"
    fi
else
    echo "   ℹ️  Git尚未初始化"
fi
echo ""

# 总结
echo "=============================================="
if [ $ERRORS -eq 0 ]; then
    echo "🎉 所有检查通过！可以安全上传到GitHub"
    echo ""
    echo "下一步："
    echo "  1. git add ."
    echo "  2. git commit -m \"feat: initial commit\""
    echo "  3. 在GitHub创建仓库"
    echo "  4. git remote add origin <仓库URL>"
    echo "  5. git push -u origin main"
    echo ""
    echo "详细步骤请查看: UPLOAD_TO_GITHUB.md"
    exit 0
else
    echo "❌ 发现 $ERRORS 个问题，请修复后再上传！"
    echo ""
    echo "查看详细指南: GITHUB_UPLOAD_CHECKLIST.md"
    exit 1
fi
