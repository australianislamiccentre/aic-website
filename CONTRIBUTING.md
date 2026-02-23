# Development Workflow

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Check for linting errors |
| `npm run lint:fix` | Auto-fix linting errors |
| `npm run type-check` | Check TypeScript types |
| `npm run validate` | Run all checks (type-check + lint + build) |

## Workflow Overview

```
main (protected) ←── PR (with checks) ←── feature-branch (your work)
```

1. **Create a feature branch** from `main`
2. **Make changes** and commit (pre-commit hooks run automatically)
3. **Push** to GitHub and create a PR
4. **Vercel creates a preview** deployment automatically
5. **GitHub Actions** run type-check, lint, and build
6. **Merge** when all checks pass

## Branch Naming

Use descriptive branch names:
- `feature/add-prayer-times` - New features
- `fix/contact-form-validation` - Bug fixes
- `update/homepage-content` - Content changes
- `refactor/donation-flow` - Code improvements

## Pre-commit Hooks

When you commit, the following checks run automatically:
- **ESLint** - Checks and auto-fixes code style issues

If a commit is blocked, fix the issues and try again.

## Troubleshooting

### Pre-commit hook failed

```bash
# See what lint errors exist
npm run lint

# Auto-fix what can be fixed
npm run lint:fix

# Then commit again
```

### Build failed locally

```bash
# Run full validation
npm run validate

# Check types specifically
npm run type-check
```

### Build fails on Vercel but works locally

1. Check that all environment variables are set in Vercel
2. Clear build cache: Vercel Dashboard → Settings → Build Cache → Clear
3. Check the build logs for specific errors

### TypeScript errors

```bash
# Check all types
npm run type-check

# The error will show file:line:column
# e.g., src/app/page.tsx:42:10
```

### Environment Variables

Required for production:
- `NEXT_PUBLIC_BASE_URL` - Your site URL (e.g., https://yoursite.com)

## GitHub Actions

Every PR and push to `main` triggers:
1. **Type check** - Ensures no TypeScript errors
2. **Lint** - Ensures code style consistency
3. **Build** - Ensures the app builds successfully

Check status in the PR or the Actions tab on GitHub.

## Vercel Deployments

- **Preview**: Every PR gets a unique preview URL
- **Production**: Merging to `main` triggers production deploy

Preview URLs look like: `aic-website-<hash>-<team>.vercel.app`
