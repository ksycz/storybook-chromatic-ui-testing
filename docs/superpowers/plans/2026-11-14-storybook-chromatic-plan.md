# Storybook + Chromatic + Playwright UI Testing Showcase — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A small public React app (workshop booking) whose components are tested in Storybook (interaction + a11y via Vitest) and visually in Chromatic, and whose user flows are tested with Playwright with page snapshots also reviewed in Chromatic, all wired into GitHub Actions.

**Architecture:** Vite + React + TS single-page app. Pure booking logic lives in `src/booking/` (unit-tested). Presentational components in `src/components/`, each with a CSF3 story file whose `play` functions are the component tests. `BookingPage` composes them and is covered only by Playwright (no page stories). Three workflows: `ci.yml` (lint, typecheck, Vitest incl. stories, build), `chromatic.yml` (stories → Chromatic project 1), `e2e.yml` (Playwright → Chromatic project 2).

**Tech Stack:** Node 22, npm, React 19, TypeScript, Vite, Storybook 10 (`@storybook/react-vite`, `@storybook/addon-vitest`, `@storybook/addon-a11y`, `@chromatic-com/storybook`), Vitest (browser mode, Playwright provider), Playwright + `@chromatic-com/playwright`, `chromatic` CLI / `chromaui/action`, ESLint.

**Spec:** `docs/superpowers/specs/2026-11-14-storybook-chromatic-design.md`

**Deviation from the spec's milestone list:** interaction and a11y tests are written together with each component (PR 2), not as a separate milestone, so every component lands already tested. PRs: 1 scaffold + pipelines · 2 domain logic + components · 3 page + Playwright · 4 README · plus the demo PR.

## Global Constraints

- Repo: public, `ksycz/storybook-chromatic-ui-testing`, default branch `main`.
- Deadline: done Sunday 15 Nov 2026, evening. Cut order if short: `Select` → TurboSnap → branch protection (describe in README instead) → "few seats" states. Never cut: Chromatic on stories, interaction tests, Playwright + Chromatic snapshots, demo PR, README.
- No UI library. Plain CSS with tokens as CSS variables in `src/styles/tokens.css`; system font stack only (no web fonts); no CSS animations or transitions anywhere.
- No `Date.now()`, `Math.random()` or locale-dependent formatting in rendered output. Dates are preformatted strings in the data.
- `BookingPage` has no stories. Page-level look is owned by Playwright + Chromatic.
- Playwright: Chromium only. No `toHaveScreenshot()`.
- Two Chromatic projects; secrets `CHROMATIC_PROJECT_TOKEN` (stories) and `CHROMATIC_PLAYWRIGHT_TOKEN` (Playwright). Chromatic jobs: `exitZeroOnChanges: true`, `autoAcceptChanges: main`.
- Accessibility runs in Vitest (`a11y: { test: 'error' }`), not as Chromatic a11y tests.
- Every PR uses her description format: **What changed / Problem it solves / How to test locally / Risk**, ending with the attribution lines. Open PRs and hand over links; don't wait for checks. Accepting visual changes in Chromatic is always her step.

## Review Focus

1. **Email with surrounding spaces or capitals** (`"  Kasia@Example.com "`) is accepted; name/email are trimmed before validation. → test in Task 2 (`validateBooking`).
2. **Double submit** (double-click or Enter twice while submitting) books once: Submit is disabled with `aria-busy` while pending, one dialog appears. → `Loading` story in Task 3, e2e test in Task 5.
3. **Keyboard-only use of the modal**: focus moves into the dialog on open, Escape closes it, focus returns to the Submit button. → `Modal` play test in Task 3, e2e test in Task 5.
4. **Sold-out workshop** can't be booked by any route: card "Book" disabled, select option disabled, and `validateBooking` rejects it if forced. → Tasks 2, 3, 5.
5. **Snapshot flake** from fonts, animations or async state: no web fonts, no animations, snapshots taken only after the awaited UI state is visible. → constraints above, Task 5 assertions precede snapshot points.

---

## Task 0: Prerequisites (Katarzyna, manual — ~10 min)

- [ ] Create a Chromatic account (sign in with GitHub). Create project **storybook-chromatic-ui-testing** linked to the repo, and a second sub-project **storybook-chromatic-ui-testing-e2e** for Playwright (Chromatic docs → "sub-projects"). Copy both project tokens.
- [ ] After Task 1 creates the repo: add GitHub secrets `CHROMATIC_PROJECT_TOKEN` and `CHROMATIC_PLAYWRIGHT_TOKEN`.

Tasks 1–3 can run before the tokens exist; their Chromatic job fails with a missing-token error until they're added. That's expected.

## Task 1: Scaffold, tooling and pipelines — PR 1

**Files:**
- Create: Vite React-TS scaffold (`package.json`, `index.html`, `vite.config.ts`, `tsconfig*.json`, `src/main.tsx`, `src/App.tsx`), `eslint.config.js`
- Create: `.storybook/main.ts`, `.storybook/preview.ts`, `vitest.config.ts`, `.storybook/vitest.setup.ts`
- Create: `src/styles/tokens.css`, `src/styles/global.css`
- Create: `.github/workflows/ci.yml`, `.github/workflows/chromatic.yml`
- Create: `docs/superpowers/specs/2026-11-14-storybook-chromatic-design.md` (copy), `docs/superpowers/plans/2026-11-14-storybook-chromatic-plan.md` (this file), short placeholder `README.md`
- Test: `src/components/Button/Button.stories.tsx` (smoke only; finished in Task 3)

**Interfaces:**
- Produces npm scripts: `dev`, `build`, `preview`, `lint`, `typecheck` (`tsc -b`), `test` (`vitest run`), `storybook`, `build-storybook`, `e2e` (added in Task 5).
- Produces CSS variables in `tokens.css`: `--color-primary`, `--color-primary-text`, `--color-surface`, `--color-border`, `--color-text`, `--color-muted`, `--color-success`, `--color-danger`, `--color-warning`, `--space-1..6`, `--radius`, `--font-body` (system stack).

- [ ] **Step 1:** `gh repo create ksycz/storybook-chromatic-ui-testing --public --clone`; scaffold with `npm create vite@latest . -- --template react-ts`; branch `chore/scaffold`.
- [ ] **Step 2:** `npm create storybook@latest` (React + Vite), then `npx storybook add @storybook/addon-vitest`, `@storybook/addon-a11y`, `@chromatic-com/storybook`. Remove the generated example stories.
- [ ] **Step 3:** In `.storybook/preview.ts` import `tokens.css` and `global.css`, set `parameters.a11y = { test: 'error' }`, `parameters.layout = 'centered'`.
- [ ] **Step 4: Write the smoke story** `Button.stories.tsx` with a placeholder `<button>` story `Primary` and `play` asserting `getByRole('button', { name: 'Book' })` is visible.
- [ ] **Step 5: Run** `npx playwright install chromium && npm run test` → Expected: 1 story test passes. `npm run lint && npm run typecheck && npm run build` → all succeed.
- [ ] **Step 6: Write `ci.yml`:** on `pull_request` and `push` to `main`; Ubuntu, Node 22, `npm ci`, `npm run lint`, `npm run typecheck`, `npx playwright install --with-deps chromium`, `npm test`, `npm run build`. Job name `ci`.
- [ ] **Step 7: Write `chromatic.yml`:** same triggers; `actions/checkout` with `fetch-depth: 0`; `npm ci`; `chromaui/action@latest` with `projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}`, `onlyChanged: true`, `exitZeroOnChanges: true`, `autoAcceptChanges: main`. Job name `chromatic-storybook`.
- [ ] **Step 8: Commit, push, open PR 1** (description format above). Hand over the link.

## Task 2: Booking domain logic

**Files:**
- Create: `src/booking/workshops.ts`, `src/booking/availability.ts`, `src/booking/validateBooking.ts`, `src/booking/submitBooking.ts`, `src/booking/index.ts`
- Test: `src/booking/availability.test.ts`, `src/booking/validateBooking.test.ts`, `src/booking/submitBooking.test.ts`

**Interfaces:**
- Produces:
  - `type Workshop = { id: string; title: string; date: string; seatsLeft: number; capacity: number }`
  - `const workshops: Workshop[]` = `visual-testing` "Intro to Visual Testing", "Sat 21 Nov 2026, 10:00", 8/12 · `storybook-for-testers` "Storybook for Testers", "Sun 22 Nov 2026, 14:00", 2/12 · `a11y-basics` "Accessibility Basics", "Sat 28 Nov 2026, 09:30", 0/12
  - `type Availability = 'available' | 'few' | 'soldOut'`; `availability(seatsLeft: number): Availability` (0 → soldOut, 1–3 → few, else available)
  - `type BookingInput = { name: string; email: string; workshopId: string }`
  - `type BookingErrors = Partial<Record<keyof BookingInput, string>>`
  - `validateBooking(input: BookingInput, list: Workshop[]): BookingErrors`
  - `submitBooking(input: BookingInput): Promise<{ confirmationId: string }>`: 300 ms delay, `confirmationId = 'BK-' + workshopId`

- [ ] **Step 1: Write failing tests:**
  - `availability`: `0→'soldOut'`, `1→'few'`, `3→'few'`, `4→'available'`.
  - `validateBooking` with the exact messages: empty input → `{ name: 'Name is required', email: 'Email is required', workshopId: 'Choose a workshop' }`; `email: 'nope'` → `email: 'Enter a valid email'`; `workshopId: 'a11y-basics'` → `workshopId: 'This workshop is sold out'`; `workshopId: 'unknown'` → `'Choose a workshop'`; valid input with `name: '  Kasia '`, `email: '  Kasia@Example.com '` → `{}` (Review Focus 1).
  - `submitBooking` with fake timers resolves `{ confirmationId: 'BK-visual-testing' }` after 300 ms.
- [ ] **Step 2: Run** `npx vitest run src/booking` → FAIL (modules missing).
- [ ] **Step 3: Implement** the functions above. Email check: trimmed, `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
- [ ] **Step 4: Run** `npx vitest run src/booking` → PASS.
- [ ] **Step 5: Commit** `feat: booking domain logic`.

## Task 3: Components with stories and interaction tests — PR 2

One folder per component: `src/components/<Name>/<Name>.tsx`, `<Name>.css`, `<Name>.stories.tsx`; barrel `src/components/index.ts`. Write each story file first (stories + `play`), run it failing, implement, run passing. Every story also passes the a11y check automatically.

**Interfaces (Produces):**
- `Button({ variant?: 'primary' | 'secondary'; loading?: boolean; disabled?: boolean; type?: 'button' | 'submit'; onClick?: () => void; children: ReactNode })`: when `loading`, disabled + `aria-busy="true"`, label replaced by "Booking…" text (no spinner animation).
- `TextField({ label: string; name: string; value: string; onChange: (value: string) => void; type?: 'text' | 'email'; error?: string; disabled?: boolean })`: error rendered below with `id={name + '-error'}`, input gets `aria-invalid` and `aria-describedby`.
- `Select({ label; name; value; onChange: (value: string) => void; options: { value: string; label: string; disabled?: boolean }[]; placeholder?: string; error?: string })`: native `<select>`, same error wiring as TextField.
- `Badge({ seatsLeft: number })`: uses `availability()`; text "8 seats left" / "Only 2 seats left" / "Sold out"; tone colour from tokens.
- `WorkshopCard({ workshop: Workshop; onBook?: (id: string) => void })`: title (h3), date, Badge, "Book" Button disabled when sold out.
- `Modal({ open: boolean; title: string; onClose: () => void; children: ReactNode })`: `role="dialog"`, `aria-modal`, labelled by title; focuses the Close button on open; Escape and Close call `onClose`; renders nothing when closed.
- `Alert({ tone: 'success' | 'error'; children })`: `role="alert"` for error, `role="status"` for success.

**Stories and `play` assertions:**

| Component | Stories | `play` asserts |
|---|---|---|
| Button | Primary, Secondary, Disabled, Loading | Primary: click calls `onClick` (`fn()`) once. Disabled & Loading: click does not call it; Loading has `aria-busy="true"` (Review Focus 2) |
| TextField | Default, Filled, WithError, Disabled | Default: typing "Kasia" calls `onChange` with last value "Kasia". WithError: input has `aria-invalid="true"` and accessible description "Name is required" |
| Select | Default, Selected, WithError, WithSoldOutOption | WithSoldOutOption: option "Accessibility Basics (sold out)" is disabled (Review Focus 4) |
| Badge | Available (8), FewSeats (2), SoldOut (0) | text matches |
| WorkshopCard | Available, FewSeats, SoldOut | Available: click Book → `onBook('visual-testing')`. SoldOut: Book disabled (Review Focus 4) |
| Modal | Open | Close button has focus; Escape calls `onClose` once (Review Focus 3) |
| Alert | Success, Error | roles `status` / `alert` |

- [ ] **Step 1:** For each component in table order: write stories → `npm test` fails → implement → `npm test` passes. Replace the Task 1 smoke story.
- [ ] **Step 2: Run** `npm run lint && npm run typecheck && npm test` → all pass, ~23 story tests, 0 a11y violations.
- [ ] **Step 3: Commit, push, open PR 2** (Tasks 2 + 3). Hand over the link and tell her the Chromatic build will show all new stories to accept.

## Task 4: BookingPage

**Files:**
- Create: `src/pages/BookingPage/BookingPage.tsx`, `BookingPage.css`
- Modify: `src/App.tsx` (renders `BookingPage` with `workshops`, or `[]` when URL has `?workshops=none`)

**Interfaces:**
- Consumes: everything from Tasks 2 and 3.
- Produces: `BookingPage({ workshops: Workshop[] })`. Visible copy the e2e tests rely on: h1 "Book a workshop"; h2 "Upcoming workshops"; empty state "No workshops scheduled yet."; form labels "Name", "Email", "Workshop"; select placeholder "Choose a workshop"; sold-out option label "<title> (sold out)"; submit "Book my seat"; error summary Alert "Please fix the errors below"; dialog title "Booking confirmed" with text "Your confirmation number is BK-<id>."

Behaviour: clicking a card's Book preselects that workshop and focuses the Name field; submit validates (errors shown, summary Alert); valid → Button `loading`, await `submitBooking`, then open Modal, reset form. On Modal close, focus returns to the submit button. While loading, submit is ignored.

- [ ] **Step 1: Implement** the page; tested in Task 5 (e2e is its test).
- [ ] **Step 2: Run** `npm run dev`, check manually the flows above; `npm run lint && npm run typecheck` pass.
- [ ] **Step 3: Commit** `feat: booking page`.

## Task 5: Playwright e2e with Chromatic snapshots — PR 3

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/booking.spec.ts`, `.github/workflows/e2e.yml`
- Modify: `package.json` (script `e2e`: `playwright test`), `.gitignore` (`playwright-report/`, `test-results/`), `vitest.config.ts` (exclude `tests/e2e/**`)

**Interfaces:**
- Consumes: Task 4 copy and URL param.

- [ ] **Step 1:** `npm i -D @playwright/test @chromatic-com/playwright chromatic`. Config: `testDir: 'tests/e2e'`, Chromium project only, `use.baseURL: 'http://localhost:4173'`, `webServer: { command: 'npm run build && npm run preview -- --port 4173 --strictPort', url: 'http://localhost:4173' }`, `reporter: [['html', { open: 'never' }]]`.
- [ ] **Step 2: Write tests** in `booking.spec.ts`, importing `{ test, expect }` from `@chromatic-com/playwright` (Chromatic snapshots the page at the end of each test, so each test ends in the state worth reviewing):
  - `books a workshop`: fill Name/Email, select "Intro to Visual Testing", click "Book my seat" → dialog "Booking confirmed" contains "BK-visual-testing".
  - `card Book preselects workshop`: click Book on "Storybook for Testers" card → Workshop select has value `storybook-for-testers`, Name focused.
  - `shows validation errors`: submit empty → texts "Name is required", "Email is required", "Choose a workshop" and alert "Please fix the errors below".
  - `sold-out workshop cannot be booked`: "Accessibility Basics" card shows "Sold out" and its Book is disabled; option "Accessibility Basics (sold out)" is disabled.
  - `empty schedule`: goto `/?workshops=none` → "No workshops scheduled yet."
  - `double submit books once` (Review Focus 2): fill valid, `dblclick` submit → exactly 1 dialog; submit had `aria-busy="true"` while pending.
  - `modal is keyboard friendly` (Review Focus 3): complete booking, press Escape → dialog gone, "Book my seat" focused. Ends on the base page (that's fine; the confirmed-modal state is captured by `books a workshop`).
- [ ] **Step 3: Run** `npm run e2e` → Expected: 7 passed. (Uploading to Chromatic happens in CI; locally only if the token is at hand: `npx chromatic --playwright -t=<token>`.)
- [ ] **Step 4: Write `e2e.yml`:** same triggers; `fetch-depth: 0`; Node 22; `npm ci`; `npx playwright install --with-deps chromium`; `npm run e2e`; upload `playwright-report/` with `actions/upload-artifact` (`if: always()`); then `chromaui/action@latest` with `playwright: true`, `projectToken: ${{ secrets.CHROMATIC_PLAYWRIGHT_TOKEN }}`, `exitZeroOnChanges: true`, `autoAcceptChanges: main`. Job name `e2e`.
- [ ] **Step 5: Commit, push, open PR 3** (Tasks 4 + 5). Hand over link.

## Task 6: README, merge gate and demo regression PR — PR 4 + demo PR

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Write README** per spec: one-paragraph intro; testing-split table (component look / component behaviour / accessibility / user flows / page look); why no page stories and why no Playwright screenshots (one line each); links (published Storybook URL from Chromatic's "Storybook" link, Chromatic library, demo PR); how to run locally (`npm ci`, `npm run storybook`, `npm test`, `npm run e2e`, `npx chromatic -t=…`); flake prevention notes; snapshot cost and TurboSnap; CI badges for the three workflows.
- [ ] **Step 2: Commit, open PR 4.** Hand over link.
- [ ] **Step 3: Branch protection** (after PRs 1–4 are merged, so check names exist): `gh api -X PUT repos/ksycz/storybook-chromatic-ui-testing/branches/main/protection` requiring status checks `ci`, `e2e`, and both Chromatic "UI Tests" checks (read exact names from a merged PR's checks list). If the API rejects or time is short, skip and leave the README sentence describing the intended gate (cut order).
- [ ] **Step 4: Demo PR** on branch `demo/visual-regression`: change `--color-primary` in `tokens.css` to a noticeably different shade and `Button` padding from `--space-2` to `--space-3`. Open the PR titled "Demo: visual regression caught by Chromatic (do not merge)", description explaining what reviewers will see in both Chromatic projects. Do not merge. Add its link to README (small follow-up commit on `main` via PR or included in PR 4 if the demo PR is opened first).
- [ ] **Step 5: Final check:** on `main`, `npm ci && npm run lint && npm run typecheck && npm test && npm run e2e` all pass; README links open. Hand over all PR links.
