# Security Policy

## 🔒 Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### Do NOT:
- ❌ Open a public issue
- ❌ Discuss it publicly on social media or forums
- ❌ Exploit the vulnerability

### Do:
1. ✅ Email details to: [your-email@example.com] (replace with your email)
2. ✅ Include detailed steps to reproduce the issue
3. ✅ Provide any relevant logs or screenshots
4. ✅ Wait for our response (we aim to respond within 48 hours)

## 🛡️ Security Best Practices

### For Users:

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, unique `SESSION_SECRET`
   - Rotate API keys periodically

2. **API Keys**
   - Keep API keys private
   - Use environment variables only
   - Enable API key restrictions (IP, domain)

3. **Database**
   - Use strong passwords in production
   - Enable SSL/TLS for database connections
   - Regular backups

4. **Deployment**
   - Always use HTTPS in production
   - Keep dependencies updated
   - Use Docker secrets for sensitive data

### For Developers:

1. **Code Security**
   - Validate all user inputs
   - Sanitize database queries (Prisma helps)
   - Use parameterized queries
   - Implement rate limiting

2. **Dependencies**
   - Run `npm audit` regularly
   - Keep packages updated
   - Review security advisories

3. **Authentication** (when implemented)
   - Use bcrypt for password hashing
   - Implement JWT securely
   - Enable CSRF protection

## 🔐 Known Security Considerations

### Current (v1.0.0):
- **Demo Mode**: No authentication implemented
  - ⚠️ Not suitable for multi-user production without auth
  - ✅ Safe for single-user local deployment

- **API Keys**: Stored in environment variables
  - ✅ Good: Not in code
  - ⚠️ Ensure `.env` is in `.gitignore`

- **Database**: SQLite file-based
  - ✅ Good for local/single-user
  - ⚠️ Use PostgreSQL for multi-user production

## 📋 Security Checklist for Production

- [ ] All API keys in environment variables
- [ ] `.env` file NOT committed to git
- [ ] HTTPS enabled
- [ ] Strong `SESSION_SECRET` set
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Prisma ORM)
- [ ] XSS protection
- [ ] Dependencies updated
- [ ] Security headers configured
- [ ] Regular backups enabled

## 🔄 Update Policy

- **Critical vulnerabilities**: Patched within 24-48 hours
- **High severity**: Patched within 1 week
- **Medium/Low**: Addressed in regular updates

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Thank you for helping keep AI Learning Assistant secure!** 🙏
