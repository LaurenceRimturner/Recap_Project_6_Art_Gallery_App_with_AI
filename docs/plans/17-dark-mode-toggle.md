# Plan: #45 Dark Mode Toggle

## Summary

A theme toggle button (Lucide `Moon` / `Sun`) in the navigation switches the page between light and dark. The theme is a `data-theme` attribute on `<html>` that swaps the existing color tokens (`--ink`, `--paper`, `--muted`, `--rule`, `--accent`) in `src/styles.css`. The initial theme comes from `localStorage`, else `prefers-color-scheme`, and is applied by a small inline script in `index.html` before the first render. Colors transition only while the user toggles. Also in this issue: the H1 links to the homepage and the detail page back link reads "Back to gallery".

## Findings

- All colors already go through five tokens in `:root`; there are no hard-coded colors besides those (only `color-mix` of the tokens). Dark mode is therefore a second token set.
- Art colors (`ColorPalette` swatches via inline `backgroundColor`, `ColorMoodBoard`) are data and stay as they are.
- The existing global rule `@media (prefers-reduced-motion: reduce) { * { transition: none !important } }` already disables the theme transition for reduced motion.
- `Navigation` is a `nav` with an "Add art piece" button (`margin-bottom: auto`, so the links sit at the bottom of the rail) and three `NavLink`s.
- jsdom has no `window.matchMedia`; tests stub it (as `useReveal.ts` already guards for it). `setupTests.ts` clears `localStorage` after each test.
- Contrast of the current light theme (WCAG relative luminance):

  | Pair on `--paper`            | Current | Needed | Result                |
  | ---------------------------- | ------- | ------ | --------------------- |
  | `--ink` text                 | 13.9    | 4.5    | ok                    |
  | `--muted` text               | 3.7     | 4.5    | **fails**             |
  | `--accent` text (active nav) | 3.6     | 4.5    | **fails**             |
  | `--paper` text on `--accent` | 3.6     | 4.5    | **fails** (badge etc) |
  | `--rule` (dividers)          | 1.5     | -      | decorative, exempt    |

  So AA in "both modes" also needs small light-theme fixes, not only a dark theme.

## Colors

| Token      | Light (new)                                        | Dark (new)                          |
| ---------- | -------------------------------------------------- | ----------------------------------- |
| `--ink`    | `rgb(22, 22, 29)` (unchanged)                      | `rgb(232, 226, 226)`                |
| `--paper`  | `rgb(233, 224, 224)` (unchanged)                   | `rgb(20, 20, 26)`                   |
| `--muted`  | `color-mix(in srgb, var(--ink) 70%, var(--paper))` | same formula                        |
| `--rule`   | unchanged (decorative only)                        | unchanged formula (decorative only) |
| `--accent` | `rgb(176, 28, 82)`                                 | `rgb(244, 114, 160)`                |
| `--scrim`  | `color-mix(in srgb, var(--ink) 55%, transparent)`  | `rgb(0 0 0 / 0.65)`                 |

Computed contrast: light muted 5.9, light accent 5.2 on paper and 4.6 on the comment tint (paper on accent 5.2); dark ink 14.3, dark accent 6.8 on paper and 6.0 on the comment tint (paper on accent 6.8), dark muted 7.5. The dark theme is not a plain swap: ink is slightly softer, the accent is lightened (a dark background needs a lighter pink, not the same one), and `color-scheme: dark` is set so native controls and scrollbars follow. The comment section tint (`color-mix` of 6 % ink into paper) is checked too, because the danger buttons there use `--accent` text; the first accent candidate `rgb(184, 32, 88)` gave only 4.3 on it. The modal backdrop used `--ink` for its scrim, which would turn into a light veil in dark mode, so it gets its own `--scrim` token. Borders that mark UI (inputs, buttons, modal) use `--ink` and stay above 3:1; `--rule` is only used for dividers, the image placeholder and the swatch outline.

## Tests per acceptance criterion

New pure helper `src/theme.ts` (`getInitialTheme`, `isTheme`), a `ThemeToggle` component, and the inline script in `index.html`.

| Criterion                                          | Test (file: name)                                                                                              | Asserts                                                                                                                                                                                                                                        |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Toggle is a button in the nav with accessible name | `Navigation.test.tsx`: shows a theme toggle button                                                             | `button` "Switch to dark mode" inside the nav; links are still exactly three                                                                                                                                                                   |
| Keyboard works                                     | `ThemeToggle.test.tsx`: toggles with Enter and Space                                                           | focus the button, `userEvent.keyboard`, `data-theme` flips                                                                                                                                                                                     |
| Click switches mode, name follows                  | `ThemeToggle.test.tsx`: switches between light and dark                                                        | click: `html[data-theme="dark"]`, name "Switch to light mode"; click again: light                                                                                                                                                              |
| Icon switches                                      | `ThemeToggle.test.tsx`: shows a moon in light mode and a sun in dark mode                                      | `lucide-moon` / `lucide-sun` class on the svg, `aria-hidden`                                                                                                                                                                                   |
| Own dark palette, AA contrast                      | `theme.test.ts`: every text/background pair is at least 4.5 (borders 3) in light and dark                      | reads the token values, computes the WCAG ratio for ink, muted, accent on paper and on the comment tint, paper on accent, both modes                                                                                                           |
| Art colors unchanged                               | `ColorPalette.test.tsx` (existing, unchanged)                                                                  | swatches keep their inline `backgroundColor`                                                                                                                                                                                                   |
| Smooth transition                                  | `ThemeToggle.test.tsx`: adds the transition class only while switching                                         | `html.theme-transition` after click, removed after the duration (fake timers)                                                                                                                                                                  |
| No transition on page load                         | `App.test.tsx`: does not animate the theme on first render                                                     | no `theme-transition` class after render                                                                                                                                                                                                       |
| Storage errors do not crash                        | `theme.test.ts`: falls back when localStorage throws / `ThemeToggle.test.tsx`: still toggles when saving fails | `getItem` throwing returns the system preference; `setItem` throwing keeps the toggle working                                                                                                                                                  |
| Rapid clicks and unmount                           | `ThemeToggle.test.tsx`: clears the transition timer                                                            | two quick clicks end light or dark consistently; unmount removes `theme-transition` and the timer                                                                                                                                              |
| Reduced motion                                     | manual check (global `transition: none !important` rule already exists)                                        | listed under Verification                                                                                                                                                                                                                      |
| Follows system preference on first visit           | `theme.test.ts`: uses the system preference without a stored theme                                             | `matchMedia` stub dark returns `"dark"`, light or absent returns `"light"`                                                                                                                                                                     |
| Persisted and restored                             | `ThemeToggle.test.tsx`: saves the choice / restores it on mount                                                | click writes `"dark"` under `theme`; seeded `"dark"` renders dark                                                                                                                                                                              |
| Invalid stored data ignored                        | `theme.test.ts`: ignores invalid stored values                                                                 | `"purple"`, `"{oops"`, `""` fall back to the system preference                                                                                                                                                                                 |
| Applied before first render                        | `indexHtml.test.ts`: the inline script sets `data-theme` from storage or system preference                     | `import html from "../index.html?raw"` (no `node:fs`, `@types/node` is not installed), extract the script and run it with seeded storage and stubbed `matchMedia`; also asserts the script comes before the module script in `<head>`/`<body>` |
| Reachable in rail and mobile bar                   | manual check at both widths                                                                                    | listed under Verification                                                                                                                                                                                                                      |
| H1 links to the homepage                           | `App.test.tsx`: links the heading to the homepage                                                              | link "Art Gallery" inside the `h1`, `href="/"`; click from `/favorites` shows the spotlight                                                                                                                                                    |
| Back button label                                  | `ArtPieceDetails.test.tsx`: shows a Back to gallery link                                                       | link "Back to gallery" with `href="/art-pieces"`                                                                                                                                                                                               |

## Files that change

- `src/theme.ts` (new): `Theme = "light" | "dark"`, `isTheme`, `getInitialTheme()` (valid stored value, else `matchMedia("(prefers-color-scheme: dark)")` if available, else light; try/catch around `localStorage`).
- `src/components/ThemeToggle.tsx` (new): owns the theme state, writes `data-theme` on `document.documentElement`, saves under `"theme"`, adds `theme-transition` to `<html>` for the duration before changing the attribute and removes it afterwards. `button type="button"`, `aria-label` "Switch to dark/light mode", Lucide `Moon` / `Sun` with `aria-hidden`.
- `src/components/Navigation.tsx`: render `<ThemeToggle />` next to "Add art piece".
- `index.html`: inline script setting `data-theme` (same rules as `getInitialTheme`, in plain JS since it runs before the bundle).
- `src/styles.css`: new light token values, `:root[data-theme="dark"]` token block with `color-scheme`, `html.theme-transition, html.theme-transition *` color/background/border transitions using `--duration` and `--ease`, placed at the end of the file and written with `!important` on `transition`, because existing rules such as `.comment-form input[type="text"]` (higher specificity, other properties) would otherwise win; the global reduced-motion rule (also `!important`, later in the file) still wins. The modal `::backdrop` uses `--scrim`, a `.nav-toggle` icon button (square, centered icon, border like `.nav-add`, `text-transform: none`, overriding the shared `nav button` styles). In the rail `margin-bottom: auto` moves from `.nav-add` to the toggle so the links stay at the bottom; in the mobile bar the `margin: 0 auto 0 0` moves to the toggle so the links stay on the right.
- `src/App.tsx`: `<h1><Link to="/">Art Gallery</Link></h1>`.
- `src/components/ArtPieceDetails.tsx`: link text "Back" becomes "Back to gallery".
- Tests: new `theme.test.ts`, `ThemeToggle.test.tsx`, `indexHtml.test.ts`; additions to `Navigation.test.tsx`, `App.test.tsx`, `ArtPieceDetails.test.tsx`. `setupTests.ts` is not changed; tests that need it stub `matchMedia` themselves.

## Out of scope

- A third "system" state, per-page themes, or a settings page.
- Changing the art colors, dimming images in dark mode, or other palette redesigns.
- Any restyling beyond color tokens and the toggle button.

## Open questions (defaults assumed, tell me to change)

1. The light theme is adjusted too (muted, accent), because the AA criterion covers both modes and the current light values fail. Default: yes (not yet confirmed; the alternative is to leave light unchanged and only document the shortfall, since CLAUDE.md says to do only what the issue asks). This slightly changes how the light page looks.
2. Existing tests that look for the link "Back" (`App.test.tsx` five times, `ArtPieceDetails.test.tsx` once) must be updated to "Back to gallery", since the required label changes. This is a requirement change, not a fix to make a test pass. Default: yes.
3. The toggle sits right after "Add art piece" at the top of the rail and at the left of the mobile bar. Default: yes.
4. The transition class is on `<html>` only during a toggle (about the length of `--duration`), instead of a permanent transition on all elements, so there is no animation on load and no slowdown of hover effects. Default: yes.

## Verification

`npm run check`, `lint`, `format:check`, `test:run`, `build`; manual check in `npm run dev`: toggle on desktop rail and mobile bar, reload keeps the choice, no flash with dark stored, system dark on first visit, OS reduced motion switches instantly, H1 link, "Back to gallery", contrast in both themes on gallery, details, favorites, modal and comments.
