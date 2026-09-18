# iRich Release Guide & Publication Manual

> This document specifies the exact, step-by-step human-controlled publication procedure for releasing **iRich v0.1.0** (and future versions) to npm and GitHub.

---

## 1. Pre-Flight Git & Working Tree Verification

Ensure that you are on the `main` branch, your local working tree is clean, and you have pulled the latest commits from the remote repository.

```bash
# Verify current branch and working directory status
git status

# Switch to main branch if not already on it
git checkout main

# Pull latest changes
git pull origin main
```

Confirm that `git status` reports: `nothing to commit, working tree clean`.

---

## 2. Complete Quality & Validation Check

Run the comprehensive test and build pipeline locally to verify that linting, type-checking, automated unit tests, and production builds pass across all packages, applications, and examples.

```bash
# Run full verification pipeline across all workspaces
pnpm check
```

Ensure all steps (`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`) exit with code `0`.

---

## 3. npm Authentication & Account Verification

Verify your active npm authentication session. Ensure you are logged in to the account with publish permissions for the `@irich` npm organization/scope.

```bash
# Verify authenticated npm user
npm whoami

# If not logged in or session expired:
npm login
```

---

## 4. npm Organization & Scope Requirements

All official iRich packages are published under the `@irich` organization scope.

- **Access Level**: Because scoped packages default to restricted access on npm, every package must be published with `--access public` (or configured via `"publishConfig": { "access": "public" }` in each `package.json`, which is already in place).
- **Two-Factor Authentication (2FA)**: Ensure you have your 2FA authenticator (TOTP or WebAuthn security key) ready for publication prompts.

---

## 5. Package Publication Order

Packages must be published in strict topological dependency order so that downstream consumers and npm registry indexers resolve dependent packages correctly:

1. **`@irich/core`** (Zero internal dependencies)
2. **`@irich/plugin-sdk`** (Depends on `@irich/core`)
3. **`@irich/renderer`** (Depends on `@irich/core`)
4. **`@irich/ui`** (Depends on `react`, `react-dom`)
5. **`@irich/rich-text`** (Depends on `@irich/core`, `@irich/plugin-sdk`)
6. **`@irich/react`** (Depends on `@irich/core`, `@irich/renderer`, `@irich/plugin-sdk`, `@irich/rich-text`, `@irich/ui`)

---

## 6. npm Publish Commands

Navigate to each package directory (or run via pnpm filter) and publish.

### Option A: Direct Step-by-Step Publishing

```bash
# Step 1: Core Engine
cd packages/core
pnpm publish --access public

# Step 2: Plugin SDK
cd ../plugin-sdk
pnpm publish --access public

# Step 3: Standalone Renderer
cd ../renderer
pnpm publish --access public

# Step 4: Accessible UI Primitives
cd ../ui
pnpm publish --access public

# Step 5: Rich Text System
cd ../rich-text
pnpm publish --access public

# Step 6: React Bindings & Visual Editor
cd ../react
pnpm publish --access public

# Return to root
cd ../..
```

### Option B: Monorepo Publication Command

```bash
pnpm -r publish --access public
```

*(Note: Private workspaces `apps/*` and `examples/*` are configured with `"private": true` and will be automatically skipped by npm/pnpm).*

---

## 7. Git Tag Creation

After npm packages have been successfully published, create an annotated Git tag matching the version string:

```bash
# Create annotated tag for v0.1.0
git tag -a v0.1.0 -m "Release iRich v0.1.0"
```

---

## 8. Pushing the Tag to Remote

Push both your commit and the annotated tag to the GitHub repository:

```bash
# Push commits to main
git push origin main

# Push the release tag
git push origin v0.1.0
```

---

## 9. GitHub Release Creation

1. Navigate to the GitHub Releases page: [https://github.com/MrSwagger1337/iRich/releases](https://github.com/MrSwagger1337/iRich/releases)
2. Click **Draft a new release**.
3. Select existing tag: **`v0.1.0`**.
4. Release Title: **`iRich v0.1.0 — Initial Release`**.
5. Copy and paste the release notes from [`CHANGELOG.md`](../CHANGELOG.md) under the `## 0.1.0` heading.
6. Click **Publish release**.

---

## 10. Post-Release Installation Smoke Test

Verify the live published packages in a clean environment:

```bash
# Create a temporary directory
mkdir -p /tmp/irich-post-release-test && cd /tmp/irich-post-release-test

# Initialize a clean test project
npm init -y

# Install published packages from npm
npm install @irich/core @irich/react @irich/renderer @irich/rich-text @irich/plugin-sdk @irich/ui react react-dom

# Verify installation and public exports
node -e "
  const core = require('@irich/core');
  console.log('Successfully loaded @irich/core version:', core.VERSION);
"

# Clean up temporary test directory
cd .. && rm -rf /tmp/irich-post-release-test
```
