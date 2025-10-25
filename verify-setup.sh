#!/bin/bash

# UX Works Setup Verification Script
# Run this to verify your setup is complete

echo "🔍 UX Works Setup Verification"
echo "================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
passed=0
failed=0

# Check function
check() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $1"
    ((passed++))
  else
    echo -e "${RED}✗${NC} $1"
    ((failed++))
  fi
}

# 1. Check Node.js
echo "Checking Node.js..."
node --version > /dev/null 2>&1
check "Node.js is installed"

# 2. Check npm
echo "Checking npm..."
npm --version > /dev/null 2>&1
check "npm is installed"

# 3. Check package.json
echo "Checking project files..."
[ -f "package.json" ]
check "package.json exists"

# 4. Check node_modules
[ -d "node_modules" ]
if [ $? -eq 0 ]; then
  check "node_modules exists (dependencies installed)"
else
  echo -e "${YELLOW}!${NC} node_modules not found. Run 'npm install'"
  ((failed++))
fi

# 5. Check .env.local
[ -f ".env.local" ]
if [ $? -eq 0 ]; then
  check ".env.local exists"

  # Check if it has the required variables
  if grep -q "NEXT_PUBLIC_SUPABASE_URL=" .env.local && grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local; then
    check "Environment variables are configured"
  else
    echo -e "${RED}✗${NC} Environment variables not configured properly"
    ((failed++))
  fi
else
  echo -e "${YELLOW}!${NC} .env.local not found. Copy from .env.local.example"
  ((failed++))
fi

# 6. Check TypeScript config
[ -f "tsconfig.json" ]
check "tsconfig.json exists"

# 7. Check Tailwind config
[ -f "tailwind.config.ts" ]
check "tailwind.config.ts exists"

# 8. Check critical directories
[ -d "src/app" ]
check "src/app directory exists"

[ -d "src/components" ]
check "src/components directory exists"

[ -d "src/lib" ]
check "src/lib directory exists"

[ -d "supabase/migrations" ]
check "supabase/migrations directory exists"

# 9. Check critical files
[ -f "src/app/layout.tsx" ]
check "Root layout exists"

[ -f "src/app/page.tsx" ]
check "Landing page exists"

[ -f "src/app/create/page.tsx" ]
check "Create session page exists"

[ -f "src/lib/supabase/client.ts" ]
check "Supabase client exists"

[ -f "supabase/migrations/001_initial_schema.sql" ]
check "Database migration exists"

# 10. Check if TypeScript compiles (if dependencies are installed)
if [ -d "node_modules" ]; then
  echo ""
  echo "Running type check..."
  npm run type-check > /dev/null 2>&1
  check "TypeScript compiles without errors"
fi

# Summary
echo ""
echo "================================"
echo "Summary:"
echo -e "${GREEN}Passed: $passed${NC}"
echo -e "${RED}Failed: $failed${NC}"
echo ""

if [ $failed -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed! You're ready to run 'npm run dev'${NC}"
  exit 0
else
  echo -e "${RED}✗ Some checks failed. Please fix the issues above.${NC}"
  echo ""
  echo "Common fixes:"
  echo "1. Run 'npm install' to install dependencies"
  echo "2. Copy .env.local.example to .env.local and add your credentials"
  echo "3. Make sure you're in the project root directory"
  exit 1
fi
