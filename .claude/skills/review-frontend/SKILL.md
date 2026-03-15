---
name: review-frontend
description: Review React Native / Expo / TypeScript code for mobile frontend standards. Checks NativeWind styling, component patterns, navigation, state management.
argument-hint: "[file or directory path]"
---

Review React Native / Expo / TypeScript code for compliance with PawTrack frontend standards and fix violations.

## Input
- File or area to review: $ARGUMENTS (if empty, review all changed .ts/.tsx files in frontend/)

## Rules

### Component Pattern
- Function declarations: `function MyComponent()` not `const MyComponent = () =>`
- Logic-first: hooks/handlers at top, JSX return at bottom
- Named interfaces for ALL props: `interface MyComponentProps { ... }`
- Helper components in same file below the default export

### Styling (MANDATORY)
- NativeWind `className` for layout, colors, text
- Brutalist offset shadows via `style` prop from `@/lib/theme.ts` — never inline shadow objects
- No StyleSheet.create — use className or style prop with theme presets
- Border radius via Tailwind classes (config maps to brutalist values: 3–8px)
- Borders: `border-[2.5px] border-fg` on cards/inputs, `border-[2px]` on smaller elements

### Typography
- `font-mono` (SpaceMono Bold) for headings, labels, section headers, stat numbers
- System font (no class) for body text, descriptions, notes
- No more than 3 type sizes per screen

### Navigation
- Expo Router file-based routing — no manual navigator setup
- Native Stack headers via `<Stack.Screen options={{...}} />` inside screen components
- NativeTabs for tab layout — never switch to JS-based Tabs
- `contentInsetAdjustmentBehavior="automatic"` on ScrollViews under native headers

### State Management
1. Local state (`useState`) → 2. Context (`PetContext`) → 3. AsyncStorage (via `@/lib/storage.ts`)
- No Redux, Zustand, or other state libs
- All async storage calls go through `@/lib/storage.ts`

### TypeScript
- Named interfaces over anonymous types (MANDATORY)
- No `any` — use `unknown` + type guards (refs can use `useRef<any>` as exception)
- No barrel exports

### Touch & Interaction
- Minimum 44pt touch targets on all interactive elements
- `hitSlop={8}` on small Pressables
- Haptic feedback via `@/lib/haptics.ts` on saves, deletes, toggles, navigation actions
- Press feedback: opacity change or shadow shift on Pressables

### Safe Areas
- Native Stack headers handle top safe area — no SafeAreaView on tab screens
- SafeAreaView with explicit `edges` prop on modals and non-stack screens
- Never use `edges={['top']}` alone when bottom content matters

## Process
1. Read target files
2. Check each rule
3. Fix violations directly
4. Run `cd frontend && npx tsc --noEmit` to verify

## Reference
- Design system: `.claude/skills/design/SKILL.md`
- Theme: `frontend/lib/theme.ts`
- Tailwind config: `frontend/tailwind.config.ts`
- Types: `frontend/lib/types.ts`

$ARGUMENTS
