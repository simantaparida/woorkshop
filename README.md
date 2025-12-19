# UX Works - Feature Prioritization Game

[![CI](https://github.com/simantaparida/ux-play/workflows/CI/badge.svg)](https://github.com/simantaparida/ux-play/actions/workflows/ci.yml)
[![E2E Tests](https://github.com/simantaparida/ux-play/workflows/E2E%20Tests/badge.svg)](https://github.com/simantaparida/ux-play/actions/workflows/e2e-tests.yml)
[![Deploy](https://github.com/simantaparida/ux-play/workflows/Deploy%20to%20Vercel/badge.svg)](https://github.com/simantaparida/ux-play/actions/workflows/deploy.yml)

A realtime, multiplayer feature prioritization tool for product and UX teams.

## Overview

UX Works lets teams collaboratively prioritize features through a simple point allocation game. A host creates a session with features, invites teammates via a shareable link, and everyone allocates 100 points across features. Results are displayed in realtime with charts and exportable data.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Hosting**: Vercel
- **Charts**: Recharts
- **Analytics**: Plausible (placeholder)

## Quick Start

### 1. Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account ([supabase.com](https://supabase.com))

### 2. Supabase Setup

1. Create a new Supabase project
2. Run the migration script in the SQL Editor:
   ```sql
   -- Copy contents of supabase/migrations/001_initial_schema.sql
   ```
3. (Optional) Run seed data for testing:
   ```sql
   -- Copy contents of supabase/seed.sql
   ```
4. Get your project URL and anon key from Project Settings > API

### 3. Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

3. Add your Supabase credentials to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Run the dev server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

### 4. Testing Locally

1. Open the app in 2-3 browser windows
2. Create a session in window 1
3. Copy the session link and open in windows 2 & 3
4. Join as different players
5. Host starts the game
6. Each player allocates points
7. View realtime results

## Project Structure

```
ux-works/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── create/            # Session creation page
│   │   ├── session/[id]/      # Session pages (lobby, vote, results)
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   ├── ui/               # Base UI components
│   │   ├── FeatureCard.tsx   # Feature voting card
│   │   ├── PlayerList.tsx    # Realtime player list
│   │   └── ResultsChart.tsx  # Results visualization
│   ├── lib/
│   │   ├── supabase/         # Supabase clients & types
│   │   ├── hooks/            # Custom React hooks
│   │   └── utils/            # Utilities & validation
│   └── types/                # TypeScript definitions
├── supabase/
│   ├── migrations/           # Database schema
│   └── seed.sql             # Test data
└── public/                   # Static assets
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/session` | POST | Create new session |
| `/api/session/:id/join` | POST | Join session as player |
| `/api/session/:id/start` | POST | Start voting (host only) |
| `/api/session/:id/vote` | POST | Submit votes |
| `/api/session/:id/results` | GET | Get aggregated results |
| `/api/session/:id/results/csv` | GET | Export results as CSV |

## Database Schema

### Tables

- **sessions**: Session metadata and status
- **features**: Features to prioritize
- **players**: Participants in each session
- **votes**: Point allocations

### Relationships

- Sessions → Features (one-to-many)
- Sessions → Players (one-to-many)
- Players + Features → Votes (many-to-many)

## Realtime Events

Supabase Realtime channels broadcast:
- Player joined
- Session started
- Player submitted votes
- Results ready

## Documentation

Comprehensive documentation is available:

### Getting Started
- **[GITHUB_SETUP.md](GITHUB_SETUP.md)** - 📋 **Start Here!** Complete guide to Git Flow, branch protection, and CI/CD setup
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - 🤝 How to contribute to this project
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide for Vercel with GitHub Actions

### CI/CD & Development
- **[GITHUB_ACTIONS.md](GITHUB_ACTIONS.md)** - CI/CD workflows documentation
- **[SECURITY_AUDIT.md](SECURITY_AUDIT.md)** - Security analysis and recommendations
- **[CLEANUP_SUMMARY.md](CLEANUP_SUMMARY.md)** - Codebase cleanup summary

## Deployment

For detailed deployment instructions, see **[DEPLOYMENT.md](DEPLOYMENT.md)**.

### Quick Deploy to Vercel

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking DSN | Optional |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL for rate limiting | Optional |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token | Optional |

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete environment setup.

## Features

### MVP (Current)

- [x] Session creation with custom features
- [x] Shareable join links
- [x] Realtime player lobby
- [x] Point allocation voting (100 points total)
- [x] Live vote tracking
- [x] Results with bar chart
- [x] CSV export
- [x] Responsive design

### Future Enhancements

- [ ] User authentication
- [ ] Session history
- [ ] Custom point totals
- [ ] Feature templates
- [ ] Team workspaces
- [ ] Advanced analytics
- [ ] Voting time limits
- [ ] Comments on features

## Development

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Build

```bash
npm run build
```

## Architecture Decisions

### Why Supabase?

- Built-in realtime subscriptions
- PostgreSQL with Row Level Security
- Generous free tier
- Simple REST API
- No backend code required

### Why Next.js App Router?

- Server components for performance
- Built-in API routes
- File-based routing
- Excellent TypeScript support
- Vercel deployment optimization

### State Management

- React hooks for local state
- Supabase Realtime for shared state
- No Redux/Zustand needed (MVP scope)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Development workflow and Git Flow branching strategy
- Code style guidelines and best practices
- Testing requirements
- Pull request process

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch from `develop`: `git checkout -b feature/your-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `npm run test && npm run test:e2e`
5. Submit a PR to `develop` branch
6. Wait for review and CI checks to pass

See [GITHUB_SETUP.md](GITHUB_SETUP.md) for detailed Git Flow workflow and branch protection setup.

## License

MIT

## Support

For issues or questions, please open a GitHub issue.

---

Built with Claude Code
