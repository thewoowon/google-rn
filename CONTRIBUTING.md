# Contributing to @thewoowon/google-rn

Thank you for your interest in contributing! We welcome contributions from everyone.

## Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest new features
- 📝 Improve documentation
- 🔧 Submit pull requests

## Development Setup

1. **Fork and clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/google-rn.git
cd google-rn
```

2. **Install dependencies**

```bash
yarn install
```

3. **Build the project**

```bash
yarn build
```

4. **Run type checking**

```bash
yarn typecheck
```

## Project Structure

```
google-rn/
├── src/                  # TypeScript source code
│   ├── hooks/           # React hooks
│   ├── utils/           # Utility functions
│   └── types/           # TypeScript type definitions
├── ios/                 # iOS native module (Swift)
├── android/             # Android native module (Kotlin)
├── lib/                 # Compiled JavaScript (generated)
├── example/             # Example React Native app
└── docs/                # Documentation
```

## Making Changes

1. Create a new branch:
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. Make your changes

3. Build and test:
   ```bash
   yarn clean
   yarn build
   yarn typecheck
   ```

4. Commit your changes:
   ```bash
   git commit -m "feat: add new feature"
   ```

   We follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` new features
   - `fix:` bug fixes
   - `docs:` documentation changes
   - `refactor:` code refactoring
   - `test:` adding tests
   - `chore:` maintenance tasks

5. Push and create a Pull Request:
   ```bash
   git push origin feature/my-new-feature
   ```

## Pull Request Guidelines

- Keep changes focused and atomic
- Write clear commit messages
- Update documentation if needed
- Add tests for new features
- Ensure all checks pass
- Request review from maintainers

## Code Style

- Use TypeScript for all new code
- Follow existing code style
- Run `yarn typecheck` before committing
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

## Testing

Currently we're setting up the testing infrastructure. In the meantime:

1. Test manually with the example app
2. Verify TypeScript types compile
3. Test on both iOS and Android

## Native Development

### iOS (Swift)

Located in `ios/` directory:
- `GoogleAuthModule.swift` - Main module implementation
- `GoogleAuthModule.m` - Objective-C bridge

### Android (Kotlin)

Located in `android/src/main/java/com/thewoowon/googlern/`:
- `GoogleAuthModule.kt` - Main module implementation
- `GoogleAuthPackage.kt` - Package registration

## Reporting Issues

When reporting bugs, please include:

- React Native version
- iOS/Android version
- Device/Simulator information
- Steps to reproduce
- Expected vs actual behavior
- Error messages and logs
- Minimal reproduction example

## Feature Requests

We love new ideas! Please:

- Check if it's already been suggested
- Explain the use case
- Describe the desired behavior
- Consider implementation complexity

## Questions?

- Open a [GitHub Discussion](https://github.com/thewoowon/google-rn/discussions)
- Check the [documentation](./README.md)
- Look at [existing issues](https://github.com/thewoowon/google-rn/issues)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
