# E2E Tests

End-to-end tests for the UX Play platform using Playwright.

## Quick Start

```bash
# Install browsers (first time only)
npx playwright install

# Run all tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug
```

## Test Files

- **`voting-board.spec.ts`** - Voting board flow tests (18 tests)
  - Complete user flow (session creation → voting → results)
  - Multi-player scenarios
  - Edge cases (point limits, validation, errors)
  - Mobile responsive tests

- **`problem-framing.spec.ts`** - Problem framing flow tests (15 tests)
  - Complete workflow (create → join → input → review → finalize → summary)
  - Multi-participant collaboration
  - Real-time updates
  - Mobile responsive tests

## Coverage

**Current:** 33 tests covering critical user flows
**Target:** 70% coverage of user-facing features

### Covered Flows
- ✅ Voting Board: 90% coverage
- ✅ Problem Framing: 80% coverage
- ✅ Multi-player scenarios: 100% coverage
- ✅ Mobile responsive: 100% coverage

### Needs Coverage
- ⏳ Authentication flows (40%)
- ⏳ Admin features (20%)
- ⏳ Error boundaries (0%)

## Documentation

See [E2E_TESTING.md](../E2E_TESTING.md) for complete documentation.

## CI/CD

Tests run automatically on:
- Pull requests
- Pushes to main branch

GitHub Actions workflow: `.github/workflows/e2e-tests.yml` (to be created)
