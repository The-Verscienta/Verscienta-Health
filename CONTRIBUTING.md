# Contributing to Verscienta Health

Thank you for your interest in contributing to Verscienta Health! This document provides guidelines and information for potential contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Documentation](#documentation)
- [Community](#community)

---

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) before contributing.

**In Summary:**
- ✅ Be respectful and inclusive
- ✅ Welcome newcomers
- ✅ Focus on constructive feedback
- ❌ No harassment or discrimination
- ❌ No trolling or insulting comments

---

## How Can I Contribute?

While Verscienta Health is a proprietary project, we welcome contributions in several areas:

### 1. **Documentation Improvements** ✍️

Documentation is crucial for user success. You can help by:
- Fixing typos and grammatical errors
- Improving clarity and examples
- Adding missing documentation
- Translating documentation to other languages
- Creating tutorials and guides

**Examples:**
- Add code examples to API documentation
- Improve setup instructions
- Create video tutorials
- Write blog posts about using the platform

### 2. **Bug Reports** 🐛

Found a bug? Help us improve by:
- Checking if the bug is already reported
- Providing detailed reproduction steps
- Including relevant logs and screenshots
- Suggesting possible fixes

**Good Bug Report:**
```markdown
**Description**: Search returns no results for valid herb names

**Steps to Reproduce**:
1. Go to /herbs
2. Enter "ginseng" in search box
3. Press Enter

**Expected**: Display ginseng results
**Actual**: "No results found" message

**Environment**:
- Browser: Chrome 120
- OS: Windows 11
- URL: https://verscienta.com

**Screenshots**: [attached]
```

### 3. **Feature Suggestions** 💡

We value your ideas! Suggest features by:
- Opening a GitHub Discussion
- Explaining the use case
- Describing the expected behavior
- Providing examples or mockups

**Note**: Feature suggestions may be implemented at the discretion of the core team based on product roadmap and priorities.

### 4. **Content Contributions** 🌿

Help expand our herbal database:
- Submit herb information with proper citations
- Provide translations (Chinese, Spanish)
- Share traditional formulas
- Add practitioner profiles

**Content Requirements:**
- Must include credible sources
- Must follow our schema structure
- Must be reviewed by domain experts
- Must comply with medical disclaimer guidelines

### 5. **Community Support** 🤝

Help other users by:
- Answering questions in Discussions
- Helping troubleshoot issues
- Creating educational content
- Sharing your success stories

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js 20+** and **pnpm**
- **PostgreSQL 17+**
- **Git**
- Basic knowledge of TypeScript and React

### Setup Development Environment

1. **Fork the Repository** (if applicable)
   ```bash
   # For documentation and content contributions
   gh repo fork verscienta/verscienta-health
   ```

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/verscienta-health.git
   cd verscienta-health
   ```

3. **Install Dependencies**
   ```bash
   pnpm install
   ```

4. **Set Up Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start Development Server**
   ```bash
   pnpm dev
   ```

6. **Verify Setup**
   - Frontend: http://localhost:3000
   - CMS: http://localhost:3001/admin

---

## Development Workflow

### 1. Create a Branch

```bash
# Feature branch
git checkout -b feature/add-api-example

# Documentation branch
git checkout -b docs/improve-setup-guide

# Bug fix branch
git checkout -b fix/search-pagination
```

### 2. Make Your Changes

- Follow our [coding standards](#coding-standards)
- Write tests for new features
- Update documentation
- Ensure all tests pass

### 3. Test Your Changes

```bash
# Run unit tests
pnpm test:unit

# Run E2E tests
pnpm test:e2e

# Run linter
pnpm lint

# Type check
pnpm type-check
```

### 4. Commit Your Changes

Follow our [commit guidelines](#commit-guidelines):

```bash
git add .
git commit -m "docs: add API integration examples"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/add-api-example
```

Then open a Pull Request on GitHub.

---

## Coding Standards

### TypeScript

**✅ Do:**
```typescript
// Use explicit types
interface HerbProps {
  name: string
  slug: string
  onSelect?: (id: string) => void
}

// Use async/await over promises
async function getHerb(slug: string): Promise<Herb> {
  const response = await fetch(`/api/herbs/${slug}`)
  return response.json()
}

// Use optional chaining
const temperature = herb?.tcmProperties?.temperature
```

**❌ Don't:**
```typescript
// Avoid 'any' type
function processData(data: any) { } // Bad

// Avoid non-null assertions unless necessary
const value = someValue! // Avoid

// Avoid large files
// Split files over 300 lines
```

### React Components

**✅ Do:**
```typescript
// Use function components with TypeScript
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  onClick?: () => void
  children: React.ReactNode
}

export function Button({ variant = 'primary', onClick, children }: ButtonProps) {
  return (
    <button className={cn('btn', `btn-${variant}`)} onClick={onClick}>
      {children}
    </button>
  )
}

// Use proper hooks
const [count, setCount] = useState<number>(0)
const memoizedValue = useMemo(() => expensiveComputation(count), [count])
```

**❌ Don't:**
```typescript
// Avoid class components
class Button extends React.Component { } // Avoid

// Avoid inline functions in JSX (when passed as props)
<Button onClick={() => handleClick()} /> // Use useCallback

// Avoid prop drilling
// Use Context or state management for deep props
```

### CSS/Styling

**✅ Do:**
```tsx
// Use Tailwind CSS
<div className="flex items-center gap-4 p-4">

// Use cn() for conditional classes
<div className={cn(
  'base-class',
  isActive && 'active-class',
  variant === 'large' && 'text-lg'
)}>

// Follow mobile-first approach
<div className="w-full md:w-1/2 lg:w-1/3">
```

**❌ Don't:**
```tsx
// Avoid inline styles (use Tailwind)
<div style={{ padding: '16px' }}> // Bad

// Avoid arbitrary values unless necessary
<div className="w-[237px]"> // Use standard spacing

// Avoid !important
// Structure your CSS properly instead
```

### File Organization

```
apps/web/
├── app/              # Next.js app router pages
├── components/
│   ├── ui/          # Reusable UI components
│   ├── features/    # Feature-specific components
│   └── layout/      # Layout components
├── lib/             # Utilities and helpers
├── hooks/           # Custom React hooks
└── types/           # TypeScript types

apps/cms/
├── src/
│   ├── collections/ # Payload collections
│   ├── hooks/       # Payload hooks
│   ├── lib/         # Utilities
│   └── cron/        # Cron jobs
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `HerbCard.tsx` |
| Files | kebab-case | `search-results.ts` |
| Functions | camelCase | `fetchHerbData()` |
| Constants | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE` |
| Interfaces | PascalCase with I prefix | `IHerbProps` |
| Types | PascalCase | `HerbCategory` |

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```bash
# Feature
git commit -m "feat(api): add herb filtering by meridians"

# Bug fix
git commit -m "fix(search): resolve pagination offset error"

# Documentation
git commit -m "docs(api): add Python SDK examples"

# With body and footer
git commit -m "feat(herbs): add TCM property filters

Add comprehensive filtering for TCM properties including:
- Temperature (hot, warm, neutral, cool, cold)
- Taste (sweet, bitter, sour, pungent, salty, bland)
- Meridians (lung, spleen, liver, etc.)

Closes #123"
```

### Commit Message Rules

✅ **Do:**
- Use imperative mood ("add" not "added")
- Keep subject line under 72 characters
- Capitalize subject line
- No period at the end of subject
- Explain "what" and "why", not "how"

❌ **Don't:**
- Don't use vague messages ("fix stuff", "updates")
- Don't combine unrelated changes
- Don't skip the body for complex changes

---

## Pull Request Process

### Before Submitting

- [ ] All tests pass (`pnpm test`)
- [ ] No linting errors (`pnpm lint`)
- [ ] No TypeScript errors (`pnpm type-check`)
- [ ] Documentation updated (if applicable)
- [ ] Commit messages follow guidelines
- [ ] Code follows our style guide

### Pull Request Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring

## Related Issues
Closes #123
Related to #456

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Checklist
- [ ] Code follows project style guide
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally
```

### Review Process

1. **Automated Checks**: CI/CD runs tests and linting
2. **Code Review**: Core team reviews code
3. **Feedback**: Address review comments
4. **Approval**: Requires 1-2 approvals
5. **Merge**: Squash and merge (usually)

### After Merge

- Delete your branch
- Update your local main branch
- Close related issues

---

## Documentation

### Documentation Types

1. **Code Comments**
   ```typescript
   /**
    * Fetches herb data by slug
    *
    * @param slug - Herb identifier (e.g., "ginseng")
    * @returns Promise resolving to herb data
    * @throws {NotFoundError} If herb doesn't exist
    *
    * @example
    * ```typescript
    * const herb = await getHerb('ginseng')
    * console.log(herb.name) // "Ginseng"
    * ```
    */
   async function getHerb(slug: string): Promise<Herb> {
     // Implementation
   }
   ```

2. **README Files**
   - Keep concise and focused
   - Include examples
   - Link to detailed docs

3. **API Documentation**
   - Update OpenAPI spec
   - Add examples
   - Document error cases

4. **User Guides**
   - Step-by-step instructions
   - Screenshots
   - Common pitfalls

### Documentation Style

- Use clear, concise language
- Write in present tense
- Use active voice
- Include code examples
- Add screenshots for UI features
- Link to related docs

---

## Community

### Communication Channels

- **GitHub Discussions**: Questions and general discussion
- **GitHub Issues**: Bug reports and feature requests
- **Discord**: Real-time community chat
- **Email**: developers@verscienta.com

### Getting Help

**Before Asking:**
1. Check existing documentation
2. Search GitHub issues/discussions
3. Review FAQ
4. Try debugging yourself

**When Asking:**
- Provide context
- Include error messages
- Share reproduction steps
- Mention what you've tried

### Recognition

Contributors are recognized in:
- **README.md** Contributors section
- **Changelog** for significant contributions
- **Release notes**
- Monthly contributor highlights

---

## License and Attribution

### Contributor License Agreement

By contributing to Verscienta Health, you agree that:

1. Your contributions are your original work
2. You grant Verscienta Health rights to use your contributions
3. Your contributions are made available under the project's license
4. You have the right to grant these permissions

### Attribution

- Code contributions include your GitHub profile
- Documentation includes author attribution
- Significant features credit contributors

---

## Additional Resources

### Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Payload CMS Documentation](https://payloadcms.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Project-Specific

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API_REFERENCE.md)
- [Setup Guide](./docs/SETUP.md)
- [Design System](./docs/DESIGN_SYSTEM.md)

---

## Questions?

If you have questions about contributing:

1. Check the [FAQ](./docs/FAQ.md)
2. Ask in [GitHub Discussions](https://github.com/verscienta/verscienta-health/discussions)
3. Join our [Discord](https://discord.gg/verscienta)
4. Email us at developers@verscienta.com

---

**Thank you for contributing to Verscienta Health! 🌿**

Together, we're building a comprehensive platform for holistic health knowledge.
