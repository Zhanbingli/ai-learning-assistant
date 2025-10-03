# Contributing to AI Learning Assistant

Thank you for your interest in contributing! 🎉

## 🚀 Quick Start for Contributors

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/ai-learning-assistant.git`
3. Install dependencies: `npm install && cd client && npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`
5. Make your changes
6. Test thoroughly
7. Commit: `git commit -m "feat: add your feature"`
8. Push: `git push origin feature/your-feature-name`
9. Open a Pull Request

## 📝 Development Guidelines

### Code Style

- **JavaScript/React**: Use ES6+ features, functional components with hooks
- **Formatting**: Prettier will auto-format on save
- **Naming**:
  - Components: PascalCase (`TaskCard.jsx`)
  - Functions: camelCase (`calculateStreak()`)
  - Constants: UPPER_SNAKE_CASE (`POMODORO_MINUTES`)

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add pomodoro timer customization
fix: resolve database connection issue
docs: update API documentation
style: format code with prettier
refactor: simplify task filtering logic
test: add unit tests for AI service
chore: update dependencies
```

### Pull Request Process

1. Update README.md if you're adding features
2. Add tests for new functionality
3. Ensure all tests pass: `npm test`
4. Update SETUP.md if setup process changes
5. Request review from maintainers

## 🏗️ Project Architecture

### Backend (`/server`)
- `index.js` - Express server setup
- `routes/` - API endpoints
- `services/` - Business logic (AI, analytics, etc.)
- `middleware/` - Express middleware

### Frontend (`/client`)
- `pages/` - Main route components
- `components/` - Reusable UI components
- `services/` - API client wrappers
- `stores/` - Zustand state management (if needed)

### Database (`/prisma`)
- `schema.prisma` - Database schema
- Migrations are auto-generated

## 🎯 Areas We Need Help

### High Priority
- [ ] Mobile-responsive design improvements
- [ ] More learning templates (languages, math, design, etc.)
- [ ] Achievement system expansion
- [ ] Social features (study groups, sharing progress)
- [ ] Improved AI prompt engineering

### Medium Priority
- [ ] Dark mode refinements
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)
- [ ] Performance optimization
- [ ] Internationalization (i18n)
- [ ] PWA features (offline mode, push notifications)

### Low Priority
- [ ] Additional chart types for analytics
- [ ] Export data to PDF/CSV
- [ ] Integration with external platforms (Notion, Todoist)
- [ ] Voice interaction

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd server && npm test

# Frontend tests
cd client && npm test

# E2E tests (if available)
npm run test:e2e
```

### Writing Tests
- Use descriptive test names: `it('should calculate streak correctly when user studies daily')`
- Test edge cases: empty data, invalid inputs, API errors
- Mock external services (AI APIs, database)

## 🐛 Bug Reports

When reporting bugs, please include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment (OS, Node version, browser)
- Error messages/logs

## 💡 Feature Requests

When suggesting features:
- Explain the use case
- Describe expected behavior
- Consider edge cases
- Think about how it fits with existing features

## 📚 Documentation

Good documentation helps everyone! Consider:
- Adding code comments for complex logic
- Updating API documentation in README.md
- Writing usage examples
- Creating tutorials or guides

## 🤝 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Questions?** Open a discussion or reach out to maintainers.

Thank you for making AI Learning Assistant better! 🙏
