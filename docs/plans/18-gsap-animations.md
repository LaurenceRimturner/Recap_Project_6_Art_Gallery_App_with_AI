# Plan: #47 More GSAP Animations (Draggable Spotlight, Favorite Pop, Page Transitions)

## Summary

The spotlight piece becomes draggable with GSAP `Draggable` (mouse and touch, limited to the page). Its position lives in `App` state, so it survives route changes and resets on reload. The favorite heart only pops when a piece becomes a favorite. Page content fades in when the route changes, through a small keyed wrapper around `<Routes>`.

## Findings

- `gsap` (3.15.1) and `@gsap/react` are installed and `gsap/Draggable` plus its types (`gsap/types/Draggable.d.ts`) ship with the package, so no new dependency.
- `FavoriteButton` **already** has a pop (`gsap.fromTo` on the heart, skipped on first render), but it also plays when a piece is **unfavorited**. The criterion says unfavoriting must not pop, so this is a small change, not a new animation.
- `useReveal` already staggers items in on `ArtPieces` and `ArtPieceDetails` (it is skipped for `prefers-reduced-motion`; the new animations deliberately do not do that, as decided in the issue).
- `Spotlight` is rendered by a route and picks its piece in `useState` on mount, so it remounts on every visit. Anything that must survive a route change has to live in `App`.
- The piece is a `.spotlight` wrapper containing a `Link` (figure with image and caption), an optional badge and the `FavoriteButton`.
- No existing test touches GSAP. jsdom has no layout, so real drag gestures cannot be simulated; the drag logic is tested through a spied `Draggable.create` (the options and callbacks we pass), plus one test with the real `Draggable` and `InertiaPlugin` that checks it mounts, the animations with real GSAP (it sets inline styles synchronously).

## Design

- **Draggable**: `Draggable.create(wrapper, { type: "x,y", trigger: figure, bounds: main, dragClickables: true, inertia: true, onPress, onRelease, onDragStart, onDragEnd, onThrowComplete })`. The trigger is the figure only (image and caption), so the heart button is never a drag start and stays clickable. The whole `.spotlight` (image, caption, heart) moves together.
- **Position state**: `App` holds `spotlightPosition: { x, y }` (`useState`, no storage) and passes `position` and `onPositionChange` to `Spotlight`. `Spotlight` applies it with `gsap.set(wrapper, { x, y })` before creating the draggable, and calls `onPositionChange({ x: this.x, y: this.y })` in `onDragEnd`.
- **Click vs drag**: a ref `dragged` is set in `onDragStart`; the link's `onClick` calls `preventDefault()` and clears the flag when it is set. A plain click never starts a drag, so the link works normally. This does not rely on Draggable's own click handling.
- **Pop**: `FavoriteButton` animates only when `isFavorite` changes from `false` to `true` (track the previous value in a ref); no pop on mount, none when unfavoriting.
- **Page transition**: a `PageTransition` component wraps `<Routes>` in `App` with `key={location.pathname}` and runs `gsap.from(el, { opacity: 0, duration: 0.35, ease: "power2.out", clearProps: "opacity" })` on mount. It is skipped on the first load (`animate` is false until the first route change), so the page does not fade twice together with `useReveal`.
- **Styling**: `cursor: grab` on the spotlight figure, `grabbing` while pressed; no color changes, so light and dark mode are unaffected.

## Tests per acceptance criterion

`Spotlight.test.tsx` spies on `Draggable.create` so it records its target and options and returns no instance; the tests call the recorded callbacks.

| Criterion                                          | Test (file: name)                                                                                                                                | Asserts                                                                                                                                                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spotlight image can be dragged (mouse and touch)   | `Spotlight.test.tsx`: makes the spotlight draggable                                                                                              | `Draggable.create` called once with the `.spotlight` wrapper, `type: "x,y"`, trigger is the figure                                                                                                  |
| Keeps the dropped position                         | `Spotlight.test.tsx`: reports the position when a drag ends                                                                                      | `onDragEnd` (with `x: 40, y: 12`) calls `onPositionChange({ x: 40, y: 12 })`                                                                                                                        |
| Position survives a page change, resets on reload  | `App.test.tsx`: keeps the dragged spotlight position after visiting another page                                                                 | drag end through the mock, go to Gallery and back, the wrapper has `transform` with `translate(40px, 12px)`                                                                                         |
|                                                    | `App.test.tsx`: starts at the original position on a fresh render                                                                                | no transform on a new `App` render; nothing written to `localStorage`                                                                                                                               |
| Cannot be dragged out of the visible area          | `Spotlight.test.tsx`: limits dragging to the page so the piece is not moved on load                                                              | `options.bounds` is the surrounding `main`                                                                                                                                                          |
| Click opens the detail page, drag does not         | `Spotlight.test.tsx`: still links to the piece on a plain click                                                                                  | link `href` is `/art-pieces/<slug>`; click without drag is not prevented                                                                                                                            |
|                                                    | `Spotlight.test.tsx`: does not follow the link after a drag                                                                                      | after `onDragStart`, clicking the link is `defaultPrevented`; the next click works again                                                                                                            |
| Velocity after release                             | `Spotlight.test.tsx`: throws the piece onward and keeps the final position                                                                       | `inertia` is on; `onThrowComplete` with `x: 80, y: 20` calls `onPositionChange({ x: 80, y: 20 })`                                                                                                   |
| Glow on hover and while dragging                   | `Spotlight.test.tsx`: marks the piece while it is dragged and sets glow colors from the piece colors; `spotlightStyles.test.ts`: styles the glow | `onPress` adds `is-dragging`; `onRelease` removes it unless a throw is running, `onThrowComplete` removes it; CSS has the glow for `.is-dragging` and, inside `@media (hover: hover)`, for `:hover` |
| Heart pops when favoriting only                    | `FavoriteButton.test.tsx`: pops the heart when it becomes a favorite                                                                             | rerender `false` to `true`: the heart span has an inline `transform` with `scale`                                                                                                                   |
|                                                    | `FavoriteButton.test.tsx`: does not pop when unfavoriting or on first render                                                                     | rerender `true` to `false`: no inline `transform`; mounted with `true`: none                                                                                                                        |
| Page content fades in on route change              | `PageTransition.test.tsx`: fades the content in after the route changes                                                                          | after navigating, the wrapper has inline `opacity: 0` and loses it once the animation finished (`waitFor`)                                                                                          |
|                                                    | `PageTransition.test.tsx`: does not fade on the first render                                                                                     | no inline opacity on the initial render                                                                                                                                                             |
| Works in light and dark mode, reveal keeps working | existing `ArtPieces.test.tsx`, `ArtPieceDetails.test.tsx`, `ThemeToggle.test.tsx`                                                                | unchanged and still passing; no color is touched by this issue (manual check in both modes)                                                                                                         |

## Added after review: velocity and glow

- **Velocity**: `inertia: true` in the `Draggable` options with `InertiaPlugin` (ships with `gsap`, registered next to `Draggable`). A release while moving throws the piece onward within the bounds. `onThrowComplete` reports the final position; `onDragEnd` still reports the release position, so leaving the page mid-throw keeps a sensible place.
- **Glow**: a soft two-layer `box-shadow` behind the image on `:hover` of the figure and while the `is-dragging` class is on the wrapper (added in `onPress`, removed in `onRelease`, or in `onThrowComplete` when the piece is still being thrown); the hover rule sits inside `@media (hover: hover)` so touch screens do not keep the glow after a tap; the image transition lists both `opacity` and `box-shadow`; CSS transition for the fade. The colors come from the piece: the wrapper gets `--glow-a` (first color) and `--glow-b` (second, or the first when there is only one) as inline custom properties; a piece without colors (own pieces) sets none and the CSS falls back to `--accent`.
- **Bounds**: `Draggable` snaps an element into its bounds on creation, so the bounds are the surrounding `main` (fallback `window`), not the window; the page wrapper `.page` joins the main grid with `subgrid` and its children span all columns (`:where(.page > *)`).
- **Click guard**: the `dragged` flag is also reset in `onPress`, so a drag that ends without a click cannot swallow the next tap.

## Files that change

- `src/components/Spotlight.tsx`: refs for wrapper and figure, `useGSAP` creating the `Draggable` (registered with `gsap.registerPlugin(Draggable)`), `dragged` ref and link `onClick`; new optional props `position` and `onPositionChange`, so the existing tests keep working.
- `src/components/FavoriteButton.tsx`: pop only on `false` to `true` (previous value in a ref).
- `src/components/PageTransition.tsx` (new): keyed wrapper with the fade; props `children` and `animate`.
- `src/App.tsx`: `spotlightPosition` state passed to `Spotlight`; `<PageTransition>` around `<Routes>` keyed by `location.pathname` and skipped for the first render.
- `src/styles.css`: `cursor: grab` / `grabbing` on the spotlight figure; `touch-action` is set by Draggable itself.
- Tests: additions to `Spotlight.test.tsx`, `FavoriteButton.test.tsx`, `App.test.tsx`; new `PageTransition.test.tsx`.

## Out of scope

- Keyboard dragging (decided in the issue), saving the position in `localStorage`, a reset button.
- `prefers-reduced-motion` handling for the new animations (decided in the issue).
- Dragging pieces on other pages, other new animations, or changing `useReveal`.

## Open questions (defaults assumed, tell me to change)

1. The whole piece (image, caption, heart) moves, not only the image, because the caption and heart belong to it. Default: yes.
2. After leaving and coming back, the spotlight shows a **new random piece** (existing behavior) at the **old position**. Default: yes; keeping the same piece is a different feature.
3. Bounds are the surrounding `main`, not the window (a window limit snapped the piece back on load). The piece can be dragged anywhere inside the page area, also under the navigation. Default: yes; to be checked in the browser.
4. `Draggable` sets `touch-action: none` on the piece, so on a phone a touch that starts on the image drags it instead of scrolling the page. Default: accepted; to be checked on a phone.
5. The page fade is skipped on the first load because `useReveal` already animates it in. Default: yes.
6. Dragging uses `dragClickables: true` with the figure as trigger. If a drag still triggers the link in a real browser, the `dragged` guard covers it, but this needs a manual check as jsdom cannot show it.

## Verification

`npm run check`, `lint`, `format:check`, `test:run`, `build`; manual check in `npm run dev` on desktop (mouse) and a phone or device emulation (touch): drag the spotlight and release, go to Gallery and back (position kept), reload (position reset), click without dragging (opens details), drag and release on the image (does not open details), heart pops only when favoriting, page fade on every route change but not on first load, all of it in light and dark mode.
