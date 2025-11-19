# Development Commands

## Setup & Install

```bash
npm install                # Install all dependencies
```

## Development

```bash
npm run dev                # Start Electron app in development mode with HMR
npm run dev:main           # Start main process only (if needed separately)
npm run dev:renderer       # Start renderer process only (if needed separately)
```

## Lint & Format

```bash
npm run lint               # Run ESLint
npm run lint:fix           # Auto-fix ESLint issues
npm run format             # Run Prettier
npm run typecheck          # Run TypeScript type checking
```

## Testing

```bash
npm run test               # Run all tests
npm run test:unit          # Run Vitest unit tests
npm run test:unit:watch    # Run unit tests in watch mode
npm run test:e2e           # Run Playwright E2E tests
npm run test:e2e:debug     # Run E2E tests with Playwright inspector
npm run test:coverage      # Generate coverage report
```

## Build & Package

```bash
npm run build              # Build for production
npm run package            # Create macOS app bundle (.app)
npm run package:mas        # Build for Mac App Store (if needed)
```

## Debugging

```bash
npm run dev                # Main process logs appear in terminal
                           # Renderer process: Open DevTools in Electron window
```

## Clean

```bash
npm run clean              # Remove dist, build artifacts
rm -rf node_modules        # Full clean (requires reinstall)
```

## Git Workflow

- Commit frequently with descriptive messages
- No deployment process - this is a desktop app
- Tag releases when creating distributable versions
