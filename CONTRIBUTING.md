# Contributing to UX Works

Thank you for your interest in contributing to UX Works! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branch Naming Conventions](#branch-naming-conventions)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Requirements](#testing-requirements)
- [Review Process](#review-process)

---

## Code of Conduct

### Our Standards

We are committed to providing a welcoming and inclusive environment. We expect all contributors to:

- ✅ Be respectful and considerate in communication
- ✅ Provide constructive feedback
- ✅ Focus on what's best for the project and community
- ✅ Show empathy toward other community members
- ❌ Do not use offensive language or personal attacks
- ❌ Do not harass or discriminate against others

---

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- Git installed and configured
- A Supabase account (for local development)
- GitHub account with SSH keys configured

### Initial Setup

1. **Fork the repository** (if external contributor):
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone git@github.com:YOUR_USERNAME/ux-works.git
   cd ux-works
   ```

2. **Clone the repository** (if team member):
   ```bash
   git clone git@github.com:simantaparida/ux-play.git
   cd ux-play
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

5. **Set up Supabase database**:
   - Follow instructions in `SUPABASE_SETUP.md`
   - Run migrations and seed data

6. **Start development server**:
   ```bash
   npm run dev
   ```

7. **Verify setup**:
   - Open http://localhost:3000
   - Create a test session
   - Verify realtime functionality works

---

## Development Workflow

We use **Git Flow** branching strategy. All development happens on feature branches that merge into `develop`, which then merges into `main` for production releases.

### Branch Structure

```
main (production)
  └── develop (staging)
      ├── feature/your-feature
      ├── bugfix/your-bugfix
      └── refactor/your-refactor
```

### Standard Workflow

1. **Start from `develop`**:
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/add-voting-timer
   ```

3. **Make your changes**:
   - Write code
   - Add tests
   - Update documentation if needed

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add countdown timer to voting phase"
   ```

5. **Keep your branch up to date**:
   ```bash
   git fetch origin
   git rebase origin/develop
   ```

6. **Push your branch**:
   ```bash
   git push -u origin feature/add-voting-timer
   ```

7. **Create a Pull Request**:
   - Go to GitHub
   - Click "New Pull Request"
   - Base: `develop`, Compare: `feature/add-voting-timer`
   - Fill out the PR template
   - Request review from team members

8. **Address review feedback**:
   - Make requested changes
   - Push updates to your branch
   - Respond to review comments

9. **Merge**:
   - After approval and CI passes, merge via GitHub
   - Use "Squash and merge" (preferred) or "Rebase and merge"
   - Delete your branch after merging

10. **Clean up locally**:
    ```bash
    git checkout develop
    git pull origin develop
    git branch -d feature/add-voting-timer
    ```

---

## Branch Naming Conventions

### Format

```
<type>/<short-description>
```

### Valid Types

| Type | Purpose | Example |
|------|---------|---------|
| `feature/` | New features | `feature/user-authentication` |
| `bugfix/` | Bug fixes | `bugfix/voting-calculation-error` |
| `hotfix/` | Emergency production fixes | `hotfix/security-vulnerability` |
| `refactor/` | Code refactoring | `refactor/session-state-management` |
| `docs/` | Documentation only | `docs/api-guide-update` |
| `test/` | Test additions/updates | `test/e2e-voting-flow` |
| `chore/` | Maintenance tasks | `chore/update-dependencies` |
| `perf/` | Performance improvements | `perf/optimize-realtime-queries` |

### Naming Rules

- ✅ Use lowercase
- ✅ Use hyphens for word separation (kebab-case)
- ✅ Be descriptive but concise (2-4 words)
- ✅ Include issue number if applicable: `feature/123-user-auth`
- ❌ No spaces or special characters except hyphens
- ❌ No uppercase letters

### Examples

✅ Good:
- `feature/voting-timer`
- `bugfix/session-timeout`
- `refactor/player-list-component`
- `docs/deployment-guide`

❌ Bad:
- `my-feature` (missing type)
- `feature/Add_User_Auth` (uppercase, underscore)
- `fix-bug` (missing type)
- `feature/this-is-a-very-long-branch-name-that-describes-everything` (too long)

---

## Commit Message Guidelines

We follow **Conventional Commits** specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: add countdown timer` |
| `fix` | Bug fix | `fix: correct vote calculation` |
| `docs` | Documentation | `docs: update API guide` |
| `style` | Code style (formatting) | `style: format with prettier` |
| `refactor` | Code refactoring | `refactor: simplify vote logic` |
| `test` | Add/update tests | `test: add voting flow tests` |
| `chore` | Maintenance | `chore: update dependencies` |
| `perf` | Performance improvement | `perf: optimize queries` |

### Scope (Optional)

The scope specifies what part of the codebase is affected:

- `voting` - Voting functionality
- `session` - Session management
- `player` - Player-related features
- `ui` - UI components
- `api` - API routes
- `db` - Database/Supabase

### Examples

**Simple commit**:
```
feat: add voting timer
```

**Commit with scope**:
```
feat(voting): add countdown timer to voting phase
```

**Commit with body**:
```
fix(voting): correct percentage calculation

The percentage calculation was dividing by total allocated points
instead of total possible points (100). This caused incorrect
results when not all points were allocated.
```

**Breaking change**:
```
feat(api)!: change session creation endpoint response

BREAKING CHANGE: The session creation endpoint now returns
{ sessionId, joinCode } instead of { id, code }. Update all
clients to use the new field names.
```

### Rules

- ✅ Use present tense ("add" not "added")
- ✅ Use imperative mood ("move" not "moves")
- ✅ Keep subject line under 72 characters
- ✅ Capitalize subject line
- ✅ No period at end of subject line
- ✅ Separate subject from body with blank line
- ✅ Wrap body at 72 characters
- ✅ Explain what and why, not how

---

## Pull Request Process

### Before Creating a PR

- [ ] Code is tested locally
- [ ] All tests pass (`npm run test`)
- [ ] Type check passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] E2E tests pass if UI changed (`npm run test:e2e`)
- [ ] Documentation updated if needed
- [ ] No console.log or debug code
- [ ] Branch is up to date with `develop`

### PR Title

Follow conventional commits format:

```
<type>(<scope>): <description>
```

Examples:
- `feat(voting): add countdown timer`
- `fix(session): resolve timeout issue`
- `docs: update deployment guide`

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement

## Related Issue
Closes #<issue_number>

## How Has This Been Tested?
Describe the tests you ran and how to reproduce them.

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] My code follows the code style of this project
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published
```

### PR Size Guidelines

Keep PRs focused and reviewable:

- ✅ **Small (S)**: < 100 lines changed - Ideal size
- ✅ **Medium (M)**: 100-400 lines - Good size
- ⚠️ **Large (L)**: 400-1000 lines - Consider splitting
- ❌ **Extra Large (XL)**: > 1000 lines - Should be split into multiple PRs

### Requesting Reviews

- Tag at least 1 reviewer
- Tag relevant team members based on expertise
- Use GitHub's "Request review" feature
- Be responsive to review comments

---

## Code Style Guidelines

### TypeScript

- ✅ Use TypeScript for all new files
- ✅ Define proper types, avoid `any`
- ✅ Use interfaces for object shapes
- ✅ Use type aliases for unions/primitives
- ✅ Enable strict mode (already configured)

```typescript
// ✅ Good
interface Player {
  id: string
  name: string
  hasVoted: boolean
}

// ❌ Bad
const player: any = { id: '123', name: 'John' }
```

### React Components

- ✅ Use functional components with hooks
- ✅ Use TypeScript for props
- ✅ Extract reusable logic into custom hooks
- ✅ Keep components focused and small
- ✅ Use proper prop destructuring

```typescript
// ✅ Good
interface PlayerCardProps {
  player: Player
  onVote: (playerId: string) => void
}

export function PlayerCard({ player, onVote }: PlayerCardProps) {
  return <div>...</div>
}

// ❌ Bad
export function PlayerCard(props: any) {
  return <div>...</div>
}
```

### File Organization

```
src/
├── app/              # Next.js pages
├── components/       # React components
│   ├── ui/          # Generic UI components
│   └── *.tsx        # Feature-specific components
├── lib/
│   ├── hooks/       # Custom React hooks
│   ├── utils/       # Utility functions
│   └── supabase/    # Supabase client & types
└── types/           # Shared TypeScript types
```

### Naming Conventions

- **Components**: PascalCase (`PlayerCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useSession.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Types/Interfaces**: PascalCase (`Player`, `SessionState`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_POINTS`)
- **Variables**: camelCase (`playerName`)

### Formatting

- ✅ Use Prettier (configured in project)
- ✅ 2 spaces for indentation
- ✅ Single quotes for strings
- ✅ Semicolons at end of statements
- ✅ Trailing commas in multi-line

### Comments

- ✅ Use JSDoc for functions/components
- ✅ Explain **why**, not **what**
- ✅ Keep comments up to date
- ❌ Don't commit commented-out code

```typescript
// ✅ Good
/**
 * Calculates vote percentages based on total allocated points.
 * Uses allocated points as denominator to show relative distribution,
 * even when total is less than 100.
 */
function calculatePercentages(votes: Vote[]): number[] {
  // ...
}

// ❌ Bad
// This function calculates percentages
function calculatePercentages(votes: Vote[]): number[] {
  // Loop through votes
  // Add up points
  // Divide by total
}
```

---

## Testing Requirements

### Unit Tests

- ✅ Write tests for all new functions/utilities
- ✅ Test edge cases and error handling
- ✅ Aim for ≥70% code coverage (enforced by CI)
- ✅ Use descriptive test names

```typescript
// src/lib/utils/__tests__/calculatePercentages.test.ts
import { describe, it, expect } from 'vitest'
import { calculatePercentages } from '../calculatePercentages'

describe('calculatePercentages', () => {
  it('should calculate correct percentages for full allocation', () => {
    const votes = [
      { featureId: '1', points: 40 },
      { featureId: '2', points: 60 },
    ]
    expect(calculatePercentages(votes)).toEqual([40, 60])
  })

  it('should handle partial allocation', () => {
    const votes = [
      { featureId: '1', points: 30 },
      { featureId: '2', points: 20 },
    ]
    expect(calculatePercentages(votes)).toEqual([60, 40])
  })

  it('should return zeros for empty votes', () => {
    expect(calculatePercentages([])).toEqual([])
  })
})
```

### Component Tests

- ✅ Test component rendering
- ✅ Test user interactions
- ✅ Test props handling
- ✅ Use React Testing Library

```typescript
// src/components/__tests__/PlayerCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PlayerCard } from '../PlayerCard'

describe('PlayerCard', () => {
  it('should render player name', () => {
    const player = { id: '1', name: 'John', hasVoted: false }
    render(<PlayerCard player={player} onVote={vi.fn()} />)
    expect(screen.getByText('John')).toBeInTheDocument()
  })

  it('should call onVote when button clicked', () => {
    const player = { id: '1', name: 'John', hasVoted: false }
    const onVote = vi.fn()
    render(<PlayerCard player={player} onVote={onVote} />)

    fireEvent.click(screen.getByRole('button'))
    expect(onVote).toHaveBeenCalledWith('1')
  })
})
```

### E2E Tests

- ✅ Add E2E tests for new user flows
- ✅ Test critical paths (session creation, voting, results)
- ✅ Use Playwright (already configured)

```typescript
// e2e/voting-flow.spec.ts
import { test, expect } from '@playwright/test'

test('complete voting flow', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Create Session')

  // Fill session details
  await page.fill('[name="sessionName"]', 'Test Session')
  await page.click('text=Create')

  // Verify session created
  await expect(page.locator('h1')).toContainText('Test Session')
})
```

### Running Tests

```bash
# Unit tests (watch mode)
npm run test

# Unit tests (run once)
npm run test:run

# Unit tests with coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E tests (UI mode)
npm run test:e2e:ui
```

---

## Review Process

### As a PR Author

1. **Self-review first**: Review your own code before requesting review
2. **Provide context**: Use PR description to explain changes
3. **Be responsive**: Reply to comments within 24 hours
4. **Be open to feedback**: Don't take criticism personally
5. **Make requested changes**: Address all review comments
6. **Request re-review**: After making changes, request another review

### As a Reviewer

1. **Review promptly**: Aim to review within 24 hours
2. **Be constructive**: Explain why changes are needed
3. **Be specific**: Point to exact lines, suggest alternatives
4. **Approve when ready**: Don't nitpick on minor issues
5. **Test if needed**: Check out the branch for complex changes

### Review Checklist

- [ ] Code follows project conventions
- [ ] Logic is clear and correct
- [ ] Tests are adequate and pass
- [ ] No security vulnerabilities introduced
- [ ] Performance implications considered
- [ ] Error handling is appropriate
- [ ] TypeScript types are correct
- [ ] No unnecessary dependencies added
- [ ] Documentation updated if needed
- [ ] No breaking changes (or properly documented)

### Review Comments Examples

✅ **Good feedback**:
> Could we extract this logic into a separate function? It would make the component easier to test and more reusable. Something like:
> ```typescript
> function calculateVotePercentage(votes: Vote[], totalPoints: number) {
>   // ...
> }
> ```

❌ **Poor feedback**:
> This is bad, rewrite it.

---

## Getting Help

If you need help:

1. **Check documentation**: README.md, GITHUB_SETUP.md, other guides
2. **Search existing issues**: Someone may have had the same question
3. **Ask in discussions**: Use GitHub Discussions for questions
4. **Open an issue**: For bugs or feature requests
5. **Reach out**: Tag maintainers in your PR if stuck

---

## Recognition

Contributors will be:
- Listed in README.md contributors section
- Mentioned in release notes for significant contributions
- Given credit in commit history

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to UX Works!** 🎉
