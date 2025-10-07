# Contributor Onboarding Guide

Welcome to Verscienta Health! This guide will help you get started as a contributor to our platform.

## Table of Contents

- [Welcome](#welcome)
- [Quick Start](#quick-start)
- [Understanding the Project](#understanding-the-project)
- [Your First Contribution](#your-first-contribution)
- [Communication](#communication)
- [Growth Path](#growth-path)
- [Resources](#resources)

---

## Welcome!

Thank you for your interest in contributing to Verscienta Health! Whether you're fixing a typo, improving documentation, or suggesting features, every contribution helps build a better platform for holistic health knowledge.

### What to Expect

- **Friendly Community**: We welcome contributors of all experience levels
- **Learning Opportunity**: Gain experience with modern web technologies
- **Meaningful Impact**: Help make holistic health knowledge accessible
- **Recognition**: Your contributions are valued and recognized

### Time Commitment

Contributions can be as small or large as you like:
- **5 minutes**: Fix a typo, improve a sentence
- **1 hour**: Write documentation, add examples
- **1 day**: Fix a bug, add a feature
- **Ongoing**: Become a regular contributor

---

## Quick Start

### 1. Introduction (5 minutes)

**Start Here:**
1. ⭐ Star the repository (shows support!)
2. 📖 Read the [README.md](../README.md)
3. 📋 Review the [Code of Conduct](../CODE_OF_CONDUCT.md)
4. 💬 Introduce yourself in [GitHub Discussions](https://github.com/verscienta/verscienta-health/discussions)

**Introduce Yourself:**
```markdown
Hi everyone! 👋

I'm [Your Name], and I'm interested in contributing to Verscienta Health.

**Background**: [Brief background - developer, herbalist, writer, etc.]
**Interests**: [What aspects of the project interest you?]
**Timezone**: [Your timezone]
**Skills**: [Languages, technologies, domain knowledge]

Looking forward to being part of the community!
```

### 2. Setup Development Environment (30-60 minutes)

Follow our detailed [Setup Guide](./SETUP.md) to get your local environment running.

**Quick Version:**

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/verscienta-health.git
cd verscienta-health

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your configuration

# 4. Set up database
pnpm db:setup

# 5. Start development servers
pnpm dev
```

**Verify Setup:**
- ✅ Frontend loads at http://localhost:3000
- ✅ CMS loads at http://localhost:3001/admin
- ✅ No errors in console

### 3. Explore the Codebase (30 minutes)

**Key Directories:**

```
verscienta-health/
├── apps/
│   ├── web/              # Next.js frontend
│   │   ├── app/          # Pages (App Router)
│   │   ├── components/   # React components
│   │   └── lib/          # Utilities
│   └── cms/              # Payload CMS backend
│       └── src/
│           ├── collections/  # Data models
│           └── hooks/        # Business logic
├── docs/                 # Documentation
└── packages/             # Shared code
```

**Take a Tour:**

1. **Browse the Frontend**
   - Visit http://localhost:3000
   - Click through herbs, formulas, conditions
   - Try the search
   - Check responsive design (resize browser)

2. **Explore the CMS**
   - Visit http://localhost:3001/admin
   - Create a test user
   - Browse collections (Herbs, Formulas, etc.)
   - Try creating/editing content

3. **Read the Code**
   - Open `apps/web/app/page.tsx` (homepage)
   - Check `apps/web/components/ui/button.tsx` (UI component)
   - Review `apps/cms/src/collections/Herbs.ts` (data model)

---

## Understanding the Project

### Architecture Overview

```
┌─────────────────┐
│  User Browser   │
└────────┬────────┘
         │
    ┌────▼────────────────┐
    │   Next.js (Web)     │
    │  - App Router       │
    │  - React Components │
    │  - Tailwind CSS     │
    └────┬────────────────┘
         │
    ┌────▼──────────────────┐
    │  Payload CMS (API)    │
    │  - Collections        │
    │  - Auth & Permissions │
    │  - Media Management   │
    └────┬──────────────────┘
         │
    ┌────▼────────────┐
    │  PostgreSQL 17  │
    │  - Herb Data    │
    │  - User Accounts│
    └─────────────────┘
```

### Technology Stack

**Frontend (Next.js):**
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **State**: React hooks
- **Search**: Algolia InstantSearch
- **Maps**: Leaflet

**Backend (Payload CMS):**
- **Framework**: Payload CMS 3
- **Database**: PostgreSQL 17
- **ORM**: Drizzle
- **Auth**: better-auth
- **Storage**: Cloudflare Images
- **Caching**: DragonflyDB

**Services:**
- **AI**: Grok AI (xAI)
- **Email**: Resend
- **Analytics**: Plausible
- **Hosting**: Coolify (self-hosted)

### Data Models

**Core Collections:**

1. **Herbs**: 15,000+ herbs with TCM and Western properties
2. **Formulas**: Traditional and modern herbal formulas
3. **Conditions**: Health conditions with treatments
4. **Practitioners**: Verified holistic health practitioners
5. **Users**: User accounts and preferences

**Example Herb Schema:**
```typescript
{
  name: "Ginseng",
  scientificName: "Panax ginseng",
  tcmProperties: {
    temperature: "Warm",
    taste: ["Sweet", "Slightly Bitter"],
    meridians: ["Lung", "Spleen", "Heart"]
  },
  westernProperties: ["Adaptogen", "Immune Modulator"],
  safetyInfo: { ... },
  // ... more fields
}
```

### Key Concepts

**Traditional Chinese Medicine (TCM):**
- **Temperature**: Hot, Warm, Neutral, Cool, Cold
- **Taste**: Sweet, Bitter, Sour, Pungent, Salty, Bland
- **Meridians**: Organ systems (Lung, Spleen, Liver, etc.)
- **Actions**: Therapeutic effects

**Herbal Medicine Basics:**
- **Herb**: Single plant medicine
- **Formula**: Combination of herbs
- **Dosage**: Amount and frequency
- **Preparation**: Decoction, powder, tincture, etc.
- **Contraindications**: When not to use

---

## Your First Contribution

### Finding Something to Work On

**Good First Issues:**

Look for issues labeled:
- `good first issue` - Perfect for beginners
- `documentation` - Documentation improvements
- `help wanted` - Community help needed
- `translation` - Language translations

**Browse Current Issues:**
https://github.com/verscienta/verscienta-health/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22

### Contribution Types by Skill Level

#### Beginner (No coding required)

**Documentation:**
- Fix typos
- Improve clarity
- Add examples
- Translate to other languages

**Example:**
```bash
# 1. Find a typo in docs/API_REFERENCE.md
# 2. Fix it
# 3. Commit and create PR
git checkout -b docs/fix-typo-api-reference
# Edit the file
git add docs/API_REFERENCE.md
git commit -m "docs: fix typo in API reference"
git push origin docs/fix-typo-api-reference
```

#### Intermediate (Basic coding)

**Component Improvements:**
- Add accessibility labels
- Improve responsive design
- Add unit tests

**Example:**
```typescript
// Before
<button onClick={handleClick}>Submit</button>

// After
<button
  onClick={handleClick}
  aria-label="Submit herb search"
  className="min-w-touch min-h-touch"
>
  Submit
</button>
```

#### Advanced (Experienced)

**Feature Development:**
- New API endpoints
- Complex UI components
- Performance optimizations

### Step-by-Step: First Pull Request

Let's make your first contribution by improving documentation:

**Step 1: Choose a Task**
```bash
# Let's add an example to API_REFERENCE.md
```

**Step 2: Create a Branch**
```bash
git checkout -b docs/add-python-example
```

**Step 3: Make Changes**
```python
# Add this to docs/API_REFERENCE.md under Python examples

# Example: Get herb by slug
herb = client.herbs.get('ginseng')
print(f"Name: {herb['name']}")
print(f"Temperature: {herb['tcmProperties']['temperature']}")
```

**Step 4: Commit**
```bash
git add docs/API_REFERENCE.md
git commit -m "docs: add Python example for getting herb by slug"
```

**Step 5: Push**
```bash
git push origin docs/add-python-example
```

**Step 6: Create Pull Request**
- Go to GitHub
- Click "Compare & pull request"
- Fill out the PR template
- Submit!

**Step 7: Respond to Feedback**
- Address review comments
- Update code as needed
- Push changes to the same branch

**Step 8: Celebrate! 🎉**
- Your PR gets merged
- You're now an official contributor!

---

## Communication

### Where to Communicate

**GitHub Discussions** - General questions, ideas
- Q&A: Ask questions
- Ideas: Propose features
- Show and Tell: Share your work

**GitHub Issues** - Specific bugs and features
- Bug Reports
- Feature Requests
- Tasks

**Discord** - Real-time chat
- #general: General discussion
- #contributors: Contributor chat
- #help: Get help
- #random: Off-topic

**Email** - Private matters
- developers@verscienta.com

### Communication Tips

**✅ Do:**
- Search before asking (question might be answered)
- Provide context and details
- Be patient waiting for responses
- Thank people for their help
- Share what you've tried

**❌ Don't:**
- Double-post in multiple channels
- Expect instant responses
- Demand attention or priority
- Ping maintainers directly without reason

### Asking Good Questions

**Bad Question:**
> "The search doesn't work. Help!"

**Good Question:**
> "The search returns no results when I enter 'ginseng' in the search box on the /herbs page.
>
> **Steps to reproduce:**
> 1. Go to http://localhost:3000/herbs
> 2. Type 'ginseng' in search box
> 3. Press Enter
>
> **Expected:** Display herbs matching 'ginseng'
> **Actual:** 'No results found' message
>
> **What I've tried:**
> - Checked browser console (no errors)
> - Verified herbs exist in database
> - Tried different search terms (same issue)
>
> **Environment:**
> - Node: v20.10.0
> - Browser: Chrome 120
> - OS: macOS 14
>
> Any ideas what might be wrong?"

---

## Growth Path

### Contribution Levels

**1. First-Time Contributor**
- Made 1 contribution
- Understand basic workflow
- Know how to submit PRs

**2. Regular Contributor**
- 5+ contributions
- Familiar with codebase
- Help others with questions

**3. Trusted Contributor**
- 25+ contributions
- Consistent quality work
- Can review PRs

**4. Core Contributor**
- 100+ contributions
- Deep codebase knowledge
- Help shape project direction

### Learning Opportunities

**Technologies to Learn:**
- **TypeScript**: Strong typing for JavaScript
- **React 19**: Modern React with hooks
- **Next.js 15**: Full-stack React framework
- **Payload CMS**: Headless CMS
- **PostgreSQL**: Relational database
- **Tailwind CSS**: Utility-first CSS

**Recommended Learning Path:**

1. **Month 1**: Documentation and simple fixes
2. **Month 2**: UI component improvements
3. **Month 3**: API endpoint additions
4. **Month 4**: Feature development
5. **Month 5+**: Complex features and architecture

### Mentorship

**Want a Mentor?**
- Request in Discord #contributors channel
- Specify what you want to learn
- Commit to regular meetings

**Want to Mentor?**
- Let us know your expertise
- We'll match you with mentees
- Flexible time commitment

---

## Resources

### Project Documentation

- [README](../README.md) - Project overview
- [Setup Guide](./SETUP.md) - Development setup
- [Contributing Guide](../CONTRIBUTING.md) - Contribution guidelines
- [API Reference](./API_REFERENCE.md) - API documentation
- [Architecture](./ARCHITECTURE.md) - System architecture
- [Design System](./DESIGN_SYSTEM.md) - UI guidelines

### Technology Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Payload CMS Docs](https://payloadcms.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

### Herbal Medicine Resources

- [American Herbalists Guild](https://www.americanherbalistsguild.com/)
- [National Institute of Medical Herbalists](https://nimh.org.uk/)
- [Chinese Medicine Database](https://www.tcmwiki.com/)

### Community

- [Discord Server](https://discord.gg/verscienta)
- [GitHub Discussions](https://github.com/verscienta/verscienta-health/discussions)
- [Twitter](https://twitter.com/verscienta)

---

## Next Steps

Now that you've completed the onboarding:

1. ✅ Join our [Discord](https://discord.gg/verscienta)
2. ✅ Introduce yourself in GitHub Discussions
3. ✅ Find a [good first issue](https://github.com/verscienta/verscienta-health/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
4. ✅ Make your first contribution
5. ✅ Share your work in #show-and-tell

**Questions?**
- Ask in Discord #help
- Create a discussion post
- Email developers@verscienta.com

---

**Welcome to the Verscienta Health community! We're excited to have you here. 🌿**

Let's build something amazing together!
