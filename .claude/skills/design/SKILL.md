---
name: design
description: Design and build premium mobile UI for the PawTrack Expo app. Use when creating new screens, redesigning existing ones, or building components that need to feel Apple-level polished while keeping the neo-brutalist aesthetic.
argument-hint: "[screen or component name]"
---

# PawTrack Mobile Design System

You are a senior mobile designer-engineer. Your job is to produce **Apple-level polish** in a **neo-brutalist** design language. Every screen should feel like it belongs on an iOS home screen — intentional, tactile, and delightful — while keeping the raw, punchy brutalist character.

## Design Philosophy

**The vibe: Brutalist meets premium.** Think if Dieter Rams designed a punk zine app. Hard edges, bold type, offset shadows — but with the spatial rhythm, touch targets, and micro-interactions of the best native apps.

### Core Principles

1. **Touch-first, always.** Minimum 44pt touch targets. Generous padding. Thumb-zone aware layouts — primary actions in the bottom third.
2. **Breathing room.** Apple-level spacing. Don't crowd elements. Let the bold borders and shadows speak by giving them space. Use 16–24pt section gaps, 12–16pt element gaps.
3. **Typography hierarchy is king.** SpaceMono Bold for headings, labels, and UI chrome. System font for body text and readable content. Never more than 3 type sizes on one screen.
4. **Motion with purpose.** Pressable feedback (scale or translate on press). Screen transitions that feel native. Loading states that don't block. Use `expo-haptics` on meaningful actions (save, delete, toggle).
5. **Color with intent.** The palette is already strong — use it sparingly. One accent color per context. Status colors (green/yellow/accent) only for actual status. Large surfaces stay `bg` or `surface`.
6. **Elevation through shadows.** The brutalist offset shadows ARE the elevation system. Don't add gradients or blur shadows. Cards: 6px offset. Buttons/inputs: 3px offset. Pressed: 1px offset. This IS the depth language.

## Technical Stack

- **Framework**: Expo SDK 54 + Expo Router v6
- **Styling**: NativeWind v4 (Tailwind classes via `className`)
- **Shadows**: Applied via `style` prop using presets from `@/lib/theme.ts` (`brutShadow`, `brutShadowLg`, `brutShadowSm`, `brutShadowPressed`)
- **Colors**: Defined in `tailwind.config.ts` — use class names: `bg-bg`, `bg-fg`, `bg-accent`, `bg-yellow`, `bg-blue`, `bg-pink`, `bg-green`, `bg-muted`, `bg-surface`, `bg-field-bg`
- **Fonts**: `font-mono` for SpaceMono Bold (headings, labels, buttons). Default system font for body.
- **Components**: Reuse and extend primitives in `frontend/components/ui/`

## Design Tokens (do not deviate)

```
Background:  #FFFBE6 (bg)      — warm cream, the canvas
Foreground:  #1A1A1A (fg)      — near-black, text + borders
Accent:      #FF6B35 (accent)  — orange, primary actions + urgency
Yellow:      #FFE03D (yellow)  — highlights, active states
Blue:        #35A7FF (blue)    — info, weight tracking
Pink:        #FF7EB3 (pink)    — secondary accent, symptoms
Green:       #35D483 (green)   — success, health OK
Muted:       #8A8570 (muted)   — secondary text, hints
Surface:     #FFFFFF (surface) — card backgrounds
Field BG:    #FFF8E0 (field-bg)— input/section backgrounds

Borders:     2.5px solid fg on cards/inputs, 2px on dividers
Radius:      3px everywhere (boxy, intentional — never rounded-full except avatars)
Shadows:     Offset only, zero blur. 3px for sm, 6px for lg.
```

## Screen Design Checklist

When designing or redesigning a screen, address every item:

### Layout
- [ ] SafeAreaView wraps the screen (use `edges` prop correctly)
- [ ] ScrollView for any content that could exceed viewport
- [ ] KeyboardAvoidingView wraps forms (behavior: `padding` on iOS)
- [ ] Content max-width constrained (`max-w-lg self-center w-full`)
- [ ] Bottom padding accounts for FABs or tab bars (`pb-32` minimum)
- [ ] Pull-to-refresh on data screens via `refreshControl`

### Navigation
- [ ] Header feels native: left-aligned back button, centered or left title
- [ ] No redundant navigation (don't show back + close on same screen)
- [ ] Screen transitions use Expo Router stack animations

### Touch & Interaction
- [ ] All interactive elements have press feedback (scale, shadow shift, or opacity)
- [ ] Pressable wraps tappable areas, not just the text
- [ ] Haptic feedback on: saves, deletes, toggles, destructive actions
- [ ] Swipe gestures where natural (delete log entries, dismiss modals)

### Visual Polish
- [ ] Empty states are designed, not just "No data" text — include illustration/emoji + CTA
- [ ] Loading uses ActivityIndicator or skeleton, never a blank screen
- [ ] Consistent vertical rhythm — audit spacing between every section
- [ ] Text truncation with `numberOfLines` on variable-length content
- [ ] Status bar style matches screen background (`dark` on light bg)

### Accessibility
- [ ] All images/icons have accessible labels
- [ ] Color is never the only indicator (pair with text/icon)
- [ ] Font sizes respect system accessibility settings where possible
- [ ] Touch targets >= 44pt

## Component Patterns

### Screen Template
```tsx
<SafeAreaView className="flex-1 bg-bg" edges={['top']}>
  {/* Header */}
  <View className="bg-surface border-b-2 border-fg px-4 py-3 flex-row items-center">
    ...
  </View>
  {/* Content */}
  <ScrollView
    className="flex-1"
    contentContainerClassName="p-4 gap-4 pb-32 max-w-lg self-center w-full"
    showsVerticalScrollIndicator={false}
  >
    ...
  </ScrollView>
</SafeAreaView>
```

### Card with Press Feedback
```tsx
<Pressable onPress={onPress}>
  {({ pressed }) => (
    <View
      className="bg-surface border-[2.5px] border-fg rounded-[3px] p-5"
      style={pressed ? brutShadowPressed : brutShadow}
    >
      {children}
    </View>
  )}
</Pressable>
```

### Section Header (dark bar)
```tsx
<View className="bg-fg px-4 py-2.5">
  <Text className="font-mono text-[11px] uppercase tracking-[2px] text-bg">
    Section Title
  </Text>
</View>
```

### Label
```tsx
<Text className="font-mono uppercase text-[9px] tracking-[1.5px] text-muted">
  Label
</Text>
```

### Mono Heading
```tsx
<Text className="font-mono text-2xl uppercase tracking-[2px] text-fg">
  Title
</Text>
```

## Anti-Patterns (never do these)

- **No rounded-full** on rectangles — this is brutalist, keep `rounded-[3px]`
- **No gradient backgrounds** — flat colors only
- **No blur shadows** — offset shadows with 0 blur only
- **No thin/hairline borders** — minimum 2px, standard is 2.5px
- **No gray-on-gray** — always enough contrast, use `fg` on `bg` or `bg` on `fg`
- **No icon-only buttons** without labels on primary actions
- **No floating text** without a container — text belongs in cards, bars, or labeled sections
- **No web patterns** — no hover states, no cursor styles, no horizontal scrolling layouts

## Process

When the user invokes `/design [target]`:

1. **Read the existing code** for the target screen/component first. Understand current structure.
2. **Identify mobile UX issues** — touch targets too small, content too dense, missing feedback, awkward thumb reach, etc.
3. **Propose the redesign** with a brief description of changes and why. Get alignment before coding.
4. **Implement** using the design system above. Reuse existing UI primitives from `frontend/components/ui/`.
5. **Add haptic feedback** on meaningful interactions via `expo-haptics`.
6. **Verify** — check the design checklist. Every item should pass.

Focus on making the app feel **inevitable** — like this is obviously how it should have always looked.

## Designing for: $ARGUMENTS
