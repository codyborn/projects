# Deployment Guide

## Pre-Deploy Checklist

Before deploying to Heroku, **always** run these checks:

### Quick Syntax Check (Recommended)
```bash
npm run syntax-check
```
This checks JavaScript syntax and would catch errors like:
- Duplicate variable declarations
- Missing brackets/braces
- Syntax errors

### Full Pre-Deploy Check
```bash
npm run pre-deploy
```
This runs:
1. ✅ JavaScript syntax validation
2. ⚠️  ESLint (warnings only - doesn't block deploy)
3. ✅ Configuration documentation check
4. ✅ Project structure validation

### Full Check (All Tests + Lint)
```bash
npm run check
```
Runs lint, tests, and pre-deploy checks.

## Deployment Workflow

1. **Make your changes**
2. **Run syntax check**: `npm run syntax-check`
3. **Run lint** (optional): `npm run lint` or `npm run lint:fix`
4. **Commit**: `git commit -m "your message"`
5. **Deploy**: `git push heroku main`

## Git Hooks

A `pre-push` hook has been installed that will automatically run syntax checks before pushing to any remote.

To bypass (not recommended):
```bash
git push --no-verify heroku main
```

## What These Checks Prevent

- ❌ **Syntax Errors** - Like duplicate variable declarations (`const initial` declared twice)
- ❌ **Runtime Errors** - Missing imports, undefined variables
- ⚠️  **Code Quality** - Linting issues (won't block deploy but good to fix)

## Troubleshooting

If syntax check fails:
1. Fix the reported errors
2. Re-run `npm run syntax-check`
3. Try deploying again

If linting fails:
1. Run `npm run lint:fix` to auto-fix many issues
2. Manually fix remaining issues
3. Re-run `npm run lint`

