# Contributing to QuakeWeather

Thank you for your interest in contributing to QuakeWeather!

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

### Prerequisites

- Node.js 20+
- Wrangler CLI: `npm install -g wrangler`
- API keys from OpenWeather, Mapbox (see README.md)

### Setup

```bash
# Install dependencies
npm install

# Create environment files (use .example files as templates)
cp .dev.vars.example .dev.vars
# Edit .dev.vars and add your API keys

# Create .env for frontend
echo "VITE_MAPBOX_TOKEN=your_mapbox_token" > .env
```

### Testing

```bash
# Type checking
npm run type-check

# ETAS unit tests
npm run test:etas

# Build
npm run build
```

## Pull Request Process

1. **Update documentation** if you're adding new features
2. **Add tests** for new functionality where applicable
3. **Ensure type checking passes**: `npm run type-check`
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

## Security

**⚠️ NEVER commit API keys or secrets to Git!**

- Use `.env` and `.dev.vars` files (they're gitignored)
- Use environment variables for all sensitive data
- Check your commits before pushing
- If you accidentally expose credentials, rotate them immediately

## Questions?

Feel free to open an issue for any questions about contributing!

---

**Thank you for helping make QuakeWeather better!**
