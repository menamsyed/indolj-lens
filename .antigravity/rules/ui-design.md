---
paths:
  - 'apps/web/**'
  - 'apps/mobile/**'
---

# UI Design Standards

> **Scope:** UI components — color system, spacing, page structure, responsive, CSS naming
> **Related:** `react.md`, `react-native.md`, `electron.md`

---

## Component Reuse — existing components first

Before writing any markup for a UI element (button, input, dropdown, badge, card,
modal, chip, skeleton, etc.), **check the project's own component library first and use
it.** Only build something new when nothing there fits the requirement.

Order of preference:

1. **The project's component library** — the app-owned primitives (e.g. web
   `apps/web/src/components/kc/*` exported from its barrel, plus feature/layout
   components). This is the first place to look, every time.
2. **shadcn/ui** — if the project uses it and has (or can add) a suitable component and
   the project library doesn't already wrap it (see `stack-reference.md`).
3. **Build a new one** — only when 1 and 2 have nothing that fits. Put it in the project
   component library (not inline in the page), match the existing primitives' prop shape
   and styling conventions, and export it from the barrel so the next feature reuses it.

**Rules:**

- Never hand-roll a raw `<button>`, `<input>`, `<select>`, etc. when a project primitive
  exists — import the primitive. (For web, use `kc/Button` instead of `<button>`,
  `kc/Input` instead of `<input>`, and so on.)
- A raw element is acceptable **only** when no primitive covers that UI shape (e.g. an
  inline text-link styled `<button>` inside a sentence, which the pill `Button` isn't
  built for) **and** it matches an existing precedent in the codebase. When in doubt,
  extend the primitive rather than fork a raw element.
- If you must create a new component, create it once in the library and reuse — don't
  copy the same bespoke markup into multiple screens.

## Design Philosophy

Every project must have an **intentional, cohesive visual identity** — not framework defaults. The specific aesthetic (dark, light, warm, minimal, playful) depends on the product.

## Color System — Define First, Reference Always

Before writing any components, define a semantic color system in `tailwind.config.ts` under `theme.extend.colors`. Reference by semantic name throughout — never hardcode hex values in components.

```typescript
// tailwind.config.ts — example structure (actual values vary per project)
colors: {
  brand: { ... },     // primary brand palette
  surface: { ... },   // backgrounds (page, card, sidebar)
  accent: { ... },    // success, warning, error, info
}
```

**Rules:**

- All colors referenced by semantic Tailwind names — never raw hex in JSX
- Page backgrounds must be intentional (not default white/black)
- Define the color system before building components

## Spacing & Rounding

- Be consistent: pick a rounding scale and stick to it across the project
- Inputs/buttons: consistent rounding (e.g., `rounded-lg` or `rounded-xl`)
- Cards/modals: larger rounding than inputs for visual hierarchy
- Pills/tags: `rounded-full`

## Motion & Interactions

- All interactive elements should have `transition` for smooth state changes
- Hover states should be visually distinct (not just cursor change)
- Keep animations subtle and fast (`duration-150` to `duration-200`)
- Avoid motion on elements that don't need it

## Empty States

- Never just text — always wrap in a styled container
- Include an icon or illustration
- Include a call-to-action when applicable

## Page Structure Patterns

### Landing / Marketing Pages

Structure: hero section → feature sections → CTA → footer.

- Hero: large heading with `tracking-tight`, subheading, primary CTA button
- Feature sections: alternating layouts (text-left/image-right, then flip) for visual rhythm
- CTA section: prominent, visually distinct from content sections
- Footer: multi-column (Product, Support, Legal, Social)

### Dashboard / List Pages

Structure: toolbar → content area (grid or list) → pagination.

- Toolbar: search input, filters, primary action button, view toggle (grid/list)
- Grid cards: consistent size, hover interaction, status indicators
- List rows: card-like appearance, no raw table dividers, active row highlighted
- Empty states: styled container with icon and CTA (never just text)

### Editor / Detail Pages

Structure: header → toolbar → content area.

- Title: large, editable if applicable, minimal chrome
- Toolbar: sticky, contains action buttons with contextual colors
- Layout: full-width with minimal padding for content-focused experience

### Sidebar & Shell

Structure: sidebar + main content area.

- Sidebar: app navigation, collapsible on mobile, user info at bottom
- Nav items: rounded, active state visually distinct from hover
- Shell: wraps all authenticated pages with consistent layout

### Shared / Public Pages

Structure: hero banner → content card.

- Hero: visual banner (gradient, image, or pattern)
- Content card: overlaps hero with negative margin for depth
- Sticky header with slight transparency/blur when scrolling

## Responsive

- Mobile-first approach with Tailwind breakpoints
- Test at minimum: mobile (375px), tablet (768px), desktop (1280px)
- Sidebar patterns: collapsible or hidden on mobile

## CSS / Tailwind Naming Conventions

| What                   | Convention                | Example                                        |
| ---------------------- | ------------------------- | ---------------------------------------------- |
| Tailwind custom colors | kebab-case semantic names | `terminal-bg`, `brand-primary`, `surface-card` |
| CSS classes (custom)   | kebab-case                | `.app-shell`, `.session-sidebar`               |
| SCSS variables         | kebab-case with `$`       | `$sidebar-width`, `$header-height`             |
| CSS custom properties  | `--{namespace}-{name}`    | `--app-sidebar-width`, `--brand-primary`       |
| Tailwind config keys   | kebab-case                | `colors.terminal.bg`, `colors.brand.light`     |

## Styling Rules

- **Tailwind** for utility classes
- **SCSS** for component-specific styles and global theming (scrollbars, third-party overrides)
- Never inline styles — use Tailwind classes or SCSS
- Keep global styles minimal — mostly resets, scrollbars, and third-party library overrides

## What NOT to Prescribe

These are **project-level decisions**, not global rules:

- Light vs dark theme
- Specific color palette
- Whether to use gradients, shadows, or flat design
- Border vs borderless card style
- Specific font choice

These should be defined in each project's `tailwind.config.ts` and documented in the project's `CLAUDE.md`.

## Shared Input Wrapper Convention

All form-control components (Input, Dropdown, DatePicker, TimePicker, Textarea, Select wrappers, etc.) MUST share the same wrapper class and label-handling pattern so they align vertically when mixed in a toolbar.

```tsx
// CORRECT — every form control follows the same shape
<div className={cn('z-input__wrapper', !label && 'z-input__wrapper--no-label', className)}>
  {label && (
    <label className="z-input__label">
      {label}
      {required && <span className="z-input__required">*</span>}
    </label>
  )}
  {/* input / button / dropdown trigger */}
</div>
```

**Rules:**

- All form controls use the same outer wrapper class (`z-input__wrapper` or equivalent token)
- When `label` is not provided, conditionally add the `--no-label` modifier so the control's top edge matches its labelled siblings sitting next to it in a filter bar
- When adding a new form control, mirror the wrapper structure of the existing Input/Dropdown — never invent a new wrapper
- This prevents From/To DatePickers (or any label-less control) from sitting at the wrong vertical position next to labelled siblings

## Clickable Cards

Cards that act as buttons (marketplace tiles, settings pickers, available-agent rows, etc.) need three things to feel like buttons instead of selectable text:

```tsx
<div
  onClick={handleClick}
  className="... cursor-pointer select-none transition hover:border-primary-300"
>
  {/* content */}
  <button
    onClick={(e) => {
      e.stopPropagation();
      handleInnerAction();
    }}
    className="..."
  >
    +
  </button>
</div>
```

**Rules:**

- Clickable cards MUST set `cursor-pointer` and `select-none` together — cursor alone leaves text-selection drag affordance which feels wrong
- Inner action buttons inside a clickable card MUST `e.stopPropagation()` so they don't double-fire the card's onClick
- Hover treatment changes border/shadow, not just cursor (consistent with general "hover must be visually distinct" rule)

## Rules Summary

- Reuse existing components first: project library → shadcn/ui → build new. Never hand-roll a raw `<button>`/`<input>`/etc. when a project primitive exists; a raw element is OK only when no primitive fits the shape and it matches codebase precedent. New components go in the library (matching existing prop/style conventions) and get reused, never copied inline per screen.
- Define a semantic color system in `tailwind.config.ts` before building any components
- Always reference colors by semantic Tailwind names — never raw hex in JSX
- Page backgrounds must be intentional — never default white/black
- Never inline styles — use Tailwind classes or SCSS classes
- Pick a consistent rounding scale and stick to it across the project
- Cards/modals use larger rounding than inputs for visual hierarchy; pills/tags use `rounded-full`
- All interactive elements must have `transition` for smooth state changes
- Hover states must be visually distinct — not just a cursor change
- Keep animations subtle and fast (`duration-150` to `duration-200`)
- Empty states must include a styled container with icon and CTA — never just text
- Use mobile-first approach with Tailwind breakpoints
- Test at minimum: mobile (375px), tablet (768px), desktop (1280px)
- Use kebab-case for custom CSS classes, Tailwind color keys, and SCSS variables
- Use `--{namespace}-{name}` for CSS custom properties
- Keep global styles minimal — mostly resets, scrollbars, and third-party overrides
- All form-control components share the same `z-input__wrapper` outer class and add `--no-label` modifier when label is omitted — keeps vertical baseline aligned in toolbars
- When adding a new form control, mirror the existing Input/Dropdown wrapper structure — never invent a new wrapper
- Clickable cards MUST set `cursor-pointer select-none` together — cursor alone leaves the text-selection drag affordance
- Inner action buttons inside a clickable card MUST `e.stopPropagation()` to avoid double-firing the card's onClick

## Icons

- **Lucide is the standard icon set** — `lucide-react` (web), `lucide-react-native` (mobile). Tree-shakeable, consistent stroke weight, one source of truth.
- Do **not** add FontAwesome or mix icon libraries — one set keeps weight/sizing consistent and the bundle lean.
- Import per-icon (named), never the whole pack: `import { Plus, Trash2 } from 'lucide-react'`.
- Size via the `size` prop (`size={16}` inline, `size={20}` buttons); color via `currentColor` / Tailwind `text-*`, not a hardcoded `color`.
