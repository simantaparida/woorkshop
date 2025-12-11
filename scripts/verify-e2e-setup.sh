#!/bin/bash

# E2E Setup Verification Script
# This script verifies that E2E testing is properly configured

echo "🔍 Verifying E2E Testing Setup..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Node version
echo "1️⃣  Checking Node.js version..."
NODE_VERSION=$(node -v)
if [[ $NODE_VERSION =~ ^v(1[8-9]|[2-9][0-9]) ]]; then
    echo -e "${GREEN}✅ Node.js $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js version too old: $NODE_VERSION (need 18+)${NC}"
    exit 1
fi
echo ""

# Check 2: Dependencies installed
echo "2️⃣  Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules directory exists${NC}"
else
    echo -e "${RED}❌ node_modules not found. Run: npm install${NC}"
    exit 1
fi
echo ""

# Check 3: Playwright installed
echo "3️⃣  Checking Playwright..."
if command -v npx &> /dev/null && npx playwright --version &> /dev/null; then
    PW_VERSION=$(npx playwright --version)
    echo -e "${GREEN}✅ Playwright installed: $PW_VERSION${NC}"
else
    echo -e "${RED}❌ Playwright not found. Run: npm install${NC}"
    exit 1
fi
echo ""

# Check 4: Playwright browsers
echo "4️⃣  Checking Playwright browsers..."
if [ -d "$HOME/Library/Caches/ms-playwright" ] || [ -d "$HOME/.cache/ms-playwright" ]; then
    echo -e "${GREEN}✅ Playwright browsers installed${NC}"
else
    echo -e "${YELLOW}⚠️  Browsers may not be installed. Run: npx playwright install${NC}"
fi
echo ""

# Check 5: Config file
echo "5️⃣  Checking configuration..."
if [ -f "playwright.config.ts" ]; then
    echo -e "${GREEN}✅ playwright.config.ts found${NC}"
else
    echo -e "${RED}❌ playwright.config.ts not found${NC}"
    exit 1
fi
echo ""

# Check 6: Test files
echo "6️⃣  Checking test files..."
TEST_COUNT=$(find e2e -name "*.spec.ts" 2>/dev/null | wc -l | tr -d ' ')
if [ "$TEST_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Found $TEST_COUNT test file(s)${NC}"
    find e2e -name "*.spec.ts" -exec basename {} \; | sed 's/^/   - /'
else
    echo -e "${RED}❌ No test files found in e2e/ directory${NC}"
    exit 1
fi
echo ""

# Check 7: Environment variables
echo "7️⃣  Checking environment variables..."
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local found${NC}"
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        echo -e "${GREEN}   ✅ NEXT_PUBLIC_SUPABASE_URL set${NC}"
    else
        echo -e "${YELLOW}   ⚠️  NEXT_PUBLIC_SUPABASE_URL not found${NC}"
    fi
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        echo -e "${GREEN}   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY set${NC}"
    else
        echo -e "${YELLOW}   ⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY not found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  .env.local not found (may need for authentication)${NC}"
fi
echo ""

# Check 8: Dev server port
echo "8️⃣  Checking if dev server is running..."
if lsof -i :3001 &> /dev/null; then
    echo -e "${GREEN}✅ Dev server running on port 3001${NC}"
else
    echo -e "${YELLOW}⚠️  Dev server not running. Start it with: npm run dev${NC}"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✨ E2E Testing Setup Verification Complete!${NC}"
echo ""
echo "📚 Next Steps:"
echo ""
echo "1. Start dev server (if not running):"
echo "   npm run dev"
echo ""
echo "2. Run smoke tests to verify basic functionality:"
echo "   npx playwright test smoke.spec.ts"
echo ""
echo "3. Run tests with UI for interactive debugging:"
echo "   npm run test:e2e:ui"
echo ""
echo "4. Run all tests:"
echo "   npm run test:e2e"
echo ""
echo "📖 Documentation:"
echo "   - E2E_TESTING.md - Complete guide"
echo "   - TESTING_TROUBLESHOOTING.md - Troubleshooting help"
echo "   - E2E_SETUP_SUMMARY.md - Setup summary"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
