# Publishing Guide for @thewoowon/google-rn

This guide explains how to publish new versions of the package to npm.

## Prerequisites

1. **npm account**: You need an npm account with publish permissions
2. **Access**: You must be added as a maintainer of `@thewoowon/google-rn`
3. **Authentication**: Run `npm login` before publishing

## Pre-publish Checklist

Before publishing, ensure:

- [ ] All tests pass (when available)
- [ ] TypeScript compiles without errors (`yarn typecheck`)
- [ ] Package builds successfully (`yarn build`)
- [ ] Version number is updated in `package.json`
- [ ] `CHANGELOG.md` is updated with new changes
- [ ] Documentation is up to date
- [ ] README examples work correctly
- [ ] Tested on both iOS and Android

## Publishing Steps

### 1. Update Version

Update the version in `package.json` following [Semantic Versioning](https://semver.org/):

- **Patch** (0.1.0 → 0.1.1): Bug fixes
- **Minor** (0.1.0 → 0.2.0): New features (backwards compatible)
- **Major** (0.1.0 → 1.0.0): Breaking changes

```bash
# Using npm version command (recommended)
npm version patch  # for bug fixes
npm version minor  # for new features
npm version major  # for breaking changes

# Or manually edit package.json
```

### 2. Update CHANGELOG.md

Add release notes:

```markdown
## [0.2.0] - 2024-11-XX

### Added
- New feature description

### Fixed
- Bug fix description

### Changed
- Breaking change description
```

### 3. Build and Test

```bash
# Clean previous build
yarn clean

# Build the package
yarn build

# Run type checking
yarn typecheck

# Test the package locally (optional)
npm pack
# This creates a .tgz file you can install in a test project
```

### 4. Commit Changes

```bash
git add .
git commit -m "chore: release v0.2.0"
git push origin main
```

### 5. Create Git Tag

```bash
git tag v0.2.0
git push origin v0.2.0
```

### 6. Publish to npm

```bash
# Dry run first to see what will be published
npm publish --dry-run

# Actually publish
npm publish --access public
```

### 7. Create GitHub Release

1. Go to https://github.com/thewoowon/google-rn/releases
2. Click "Draft a new release"
3. Choose the tag you created (v0.2.0)
4. Title: "Release v0.2.0"
5. Copy the relevant section from CHANGELOG.md
6. Publish release

## Automated Publishing (GitHub Actions)

The repository includes a GitHub Actions workflow for automated publishing:

1. **On release creation**: Automatically publishes to npm
2. **Manual trigger**: Use "Publish to NPM" workflow in Actions tab

### Setup GitHub Actions

Add npm token to repository secrets:

1. Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Create a new "Automation" token
3. Go to GitHub repository Settings > Secrets and variables > Actions
4. Add secret: `NPM_TOKEN` = your npm token

## Troubleshooting

### "You do not have permission to publish"

- Ensure you're logged in: `npm whoami`
- Check if you're a maintainer: `npm owner ls @thewoowon/google-rn`
- Contact package owner to add you: `npm owner add USERNAME @thewoowon/google-rn`

### "Version already exists"

- Update version in package.json to a new version
- Check existing versions: `npm view @thewoowon/google-rn versions`

### Build fails

- Clean and rebuild: `yarn clean && yarn build`
- Check TypeScript errors: `yarn typecheck`
- Verify all dependencies are installed: `yarn install`

## Post-publish

After publishing:

1. Verify package is live: https://www.npmjs.com/package/@thewoowon/google-rn
2. Test installation in a fresh project:
   ```bash
   npx react-native init TestApp
   cd TestApp
   yarn add @thewoowon/google-rn
   ```
3. Update documentation if needed
4. Announce the release on relevant channels

## Version Strategy

- **0.x.x**: Pre-1.0, API may change
- **1.x.x**: Stable API, breaking changes require major version bump
- Follow [Semantic Versioning](https://semver.org/) strictly after 1.0.0

## Support

For questions about publishing:
- Open an issue on GitHub
- Contact maintainers via email
