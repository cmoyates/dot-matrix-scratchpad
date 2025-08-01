# Dot Matrix Scratchpad

## Conventions

- Always use arrow functions for typescript function definitions (unless explicily asked to do otherwise)
- Don't explicitly provide return types for typescript functions; let them be inferred.
- Use `react-native-reusables` for common components and utilities.
- Use `react-native-primatives` for primitive components.
- Use the components from `components/ui/typography.tsx` for typography.

## Aliases

- `react-native-reusables` can also be referred to as `rnr` or `reusables`
- `react-native-primatives` can also be referred to as `rnp` or `primitives`

## MCP Servers

### Snap Happy

- Use the `snap-happy` MCP server to take screenshots of the app.

### Context7

- Always use the context7 MCP server to reference documentation for libraries like `react-native-firebase` and `zod`
- For the tokens, start with 5000 but then increase to 20000 if your first search didn't give relevant documentation.
- Only search three times maximum for any specific piece of documentation.

## Animations

- Use `react-native-reanimated` for animations and transitions.
- Refer to the `spec/ANIMATION_GUIDELINES.md` doc for comprehensive animation guidelines.
