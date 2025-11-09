# Contributing to QuakeWeather

Thank you for your interest in contributing to QuakeWeather! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help create a welcoming environment for all contributors

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a branch** for your changes
4. **Make your changes** with clear commit messages
5. **Test thoroughly** before submitting
6. **Submit a pull request**

## Development Setup

See the main [README.md](README.md) for detailed setup instructions.

### Quick Start

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev           # Frontend (port 5173)
pnpm pages:dev     # Backend API (port 8787 via Cloudflare Pages Functions)
```

## Pull Request Process

1. **Update documentation** if you're adding new features
2. **Add tests** for new functionality where applicable
3. **Ensure type checking passes**: `pnpm type-check`
4. **Update the README.md** with details of changes if needed
5. **Reference any related issues** in your PR description

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Prefer interfaces over types for object shapes
- Use `const` over `let` where possible
- Avoid `any` type - use `unknown` or proper types

### React

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use TypeScript for prop types

### Styling

- Use TailwindCSS utility classes
- Follow the existing color scheme
- Ensure dark mode support for new UI elements
- Use semantic class names when needed

### Code Organization

- Place React components in `src/client/components/`
- Place API routes in `src/server/routes/`
- Place utility functions in `src/server/lib/` or `src/client/utils/`
- Keep files focused on a single responsibility

## Commit Messages

Use clear, descriptive commit messages:

- `feat: add weather alerts display`
- `fix: correct magnitude color scaling`
- `docs: update API documentation`
- `refactor: simplify cache key generation`
- `style: improve mobile responsiveness`

## Testing

While we don't have comprehensive tests yet, please:

1. **Test manually** all changes
2. **Verify on different browsers** (Chrome, Firefox, Safari)
3. **Check mobile responsiveness**
4. **Test with different data scenarios**

## Feature Requests & Bug Reports

- Use GitHub Issues for both
- Provide detailed reproduction steps for bugs
- Include screenshots/videos when relevant
- Tag issues appropriately

## Questions?

Feel free to open an issue for any questions about contributing!

---

**Thank you for helping make QuakeWeather better!**

