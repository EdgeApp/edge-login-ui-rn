# AGENTS.md

Guidance for automated agents and contributors working in this repository.

## Code Style & Conventions

- **Text Components**: Use `EdgeText` instead of raw `Text` for display strings so font scaling and theming stay consistent.
- **Icons**: Use a shared icon from `src/components/icons/ThemedIcons` rather than importing `react-native-vector-icons` directly, so color and size stay driven by `useTheme()` instead of hard-coded per call site. When no suitable icon exists, add a new themed definition to `ThemedIcons` rather than reaching for the raw library. A `no-restricted-imports` ESLint rule (level `warn`) flags direct imports; the `ThemedIcons` wrapper is exempt because it is the module that re-exports the library.
- **Component Reuse**: Strongly prefer reusing existing shared components over building new ones or dropping to raw library primitives. Before adding UI, look for a component that already covers the need (for example card rows via `EdgeCard` + `EdgeRow`), and keep color, sizing, and styling driven by `useTheme()`. When nothing suitable exists, add a reusable, themed definition instead of a one-off.
- **Localized Strings**: All user-facing text comes from `lstrings.*`, never hard-coded literals.
