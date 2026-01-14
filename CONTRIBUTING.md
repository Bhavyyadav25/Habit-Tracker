# Contributing to HabitFlow

First off, thank you for considering contributing to HabitFlow! It's people like you that make HabitFlow such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct: be respectful, inclusive, and constructive in all interactions.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if applicable**
- **Include your environment details** (OS version, app version)

### Suggesting Features

Feature suggestions are welcome! Please:

- **Use a clear and descriptive title**
- **Provide a detailed description of the proposed feature**
- **Explain why this feature would be useful**
- **Include mockups or examples if possible**

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes** following our coding standards
4. **Test your changes**: `npm run tauri dev`
5. **Ensure TypeScript compiles**: `npm run typecheck`
6. **Commit your changes** with a descriptive message
7. **Push to your fork** and submit a pull request

## Development Setup

### Prerequisites

- Node.js 18+
- Rust (latest stable)
- Tauri CLI dependencies (see README)

### Getting Started

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/habitflow.git
cd habitflow

# Install dependencies
npm install

# Start development
npm run tauri dev
```

### Project Structure

```
src/
├── components/     # React components
│   ├── ui/        # Reusable UI components
│   ├── habits/    # Habit-related components
│   ├── mood/      # Mood tracking
│   ├── pomodoro/  # Pomodoro timer
│   ├── stats/     # Statistics & charts
│   ├── achievements/ # Gamification
│   └── settings/  # Settings page
├── stores/        # Zustand state stores
├── lib/           # Utilities & constants
└── types/         # TypeScript definitions
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types/interfaces
- Avoid `any` type when possible

### React

- Use functional components with hooks
- Keep components small and focused
- Use proper prop types

### Styling

- Use Tailwind CSS utility classes
- Follow existing naming patterns
- Use CSS variables for theming (`var(--text-primary)`, etc.)

### Commits

Write clear, concise commit messages:

```
Add feature X that does Y

- Detail about implementation
- Another detail
```

## Adding New Features

### Adding a New Theme

1. Add theme colors in `src/index.css`
2. Add theme definition in `src/lib/constants.ts` (UNLOCKABLE_THEMES)
3. Add CSS overrides for Tailwind classes if needed

### Adding a New Achievement

1. Add achievement type to `src/types/index.ts` (AchievementType)
2. Add achievement definition in `src/lib/constants.ts` (ACHIEVEMENTS)
3. Add progress calculation in `AchievementsPage.tsx`

### Adding a New Icon Pack

1. Add icon pack to `src/lib/constants.ts` (ICON_PACKS)
2. The HabitForm will automatically pick it up

## Questions?

Feel free to open an issue with the "question" label if you need help!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
