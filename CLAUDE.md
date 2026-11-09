# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- React 19, TypeScript, Vite, React Router, SWR
- Vitest + React Testing Library (jsdom), configured in the `test` block of `vite.config.ts`
- ESLint (flat config) and Prettier
- Art data from `https://example-apis.vercel.app/api/art`
- Node.js 22.22+

## Commands

- `npm run dev` – dev server (port 3000)
- `npm run build` – production build
- `npm run check` – type-check (`tsc --noEmit`)
- `npm run test:run` – all tests once
- `npm run coverage` – tests with coverage, writes `coverage/lcov.info`
- `npm run lint` – ESLint
- `npm run format` – format with Prettier
- `npm run format:check` – check formatting with Prettier
- Single test file: `npx vitest run src/path/file.test.tsx`

Checks before every PR: `check`, `lint`, `format:check`, `test:run`, `build`.

## Conventions

- One feature branch (`feature/<n>-<slug>`) and one PR per issue.
- Test-first: write a failing test per acceptance criterion, then the minimal code.
- Components and tests are `.tsx`; Vitest patterns must cover both, e.g. `src/**/*.{ts,tsx}`.
- Vitest globals are enabled (no imports of `test`, `expect`, `vi`).
- Coverage settings go in `vite.config.ts`; never create a `vitest.config.ts` (it would override the existing jsdom setup).
- Routes live in `src/App.tsx`; `BrowserRouter` is in `src/index.tsx`.

## Off limits

- Never use `npm test` (watch mode); use `npm run test:run`.
- Never change a test to make it pass.
- Never lower a threshold or disable a rule to make a check green.
- Only do what the current issue asks for.
- Never work on `main`; never read `.env*` or `secrets/`.
