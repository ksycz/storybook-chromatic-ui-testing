# Storybook + Chromatic + Playwright UI testing showcase — design

Date: 2026-11-14
Status: draft for approval
Will live in the new repo at `docs/superpowers/specs/2026-11-14-storybook-chromatic-design.md`.

## Intent and why

Katarzyna is a senior test automation engineer (Cypress at work, Playwright in personal projects) looking for a new QA / SDET role. Storybook and Chromatic show up in several job ads, and one company she wants to join uses Storybook, Chromatic **and** Playwright. Her existing GitHub portfolio covers Playwright + AI testing and prompt evals, but nothing on component-level UI testing or visual regression.

This repo should show a hiring team that she can set up and run the UI testing workflow that a team using those three tools would plausibly run: components tested in isolation, user flows tested end to end, visual changes reviewed and approved on every PR, all wired into GitHub Actions.

## Success looks like

- A reviewer opens the repo and, from the README alone, understands what is tested where and why, in under five minutes.
- Every PR runs the full pipeline in GitHub Actions and shows Chromatic's visual review checks next to the test checks.
- A deliberately broken PR (kept open, linked from the README) shows one visual regression caught twice: as a component diff (Storybook snapshot) and as a page diff (Playwright snapshot), plus a failing interaction test if the break is behavioural.
- A live, clickable Storybook (published by Chromatic) is linked from the README.
- She can explain every piece of it in an interview.

## Goals

1. Small React app with a handful of components and one page that combines them.
2. A story for each meaningful component state (variants, disabled, loading, error, empty).
3. Interaction tests with Storybook `play` functions, run in CI through the Storybook Vitest addon.
4. Accessibility checks with the Storybook a11y addon, run in the same Vitest job.
5. Chromatic visual testing of all stories on every PR, with TurboSnap.
6. A few Playwright end-to-end tests of user flows on the running app, with Chromatic's Playwright integration capturing page-level snapshots.
7. GitHub Actions pipelines for all of the above.
8. README that explains the testing strategy and the split between tools.

## Non-goals

- Playwright's own `toHaveScreenshot()` baselines (rejected, see Approaches).
- Cross-browser visual testing. Chromatic's free plan tests on Chrome only; that's fine.
- A backend, real API or auth. Data is static/local.
- Design polish beyond "clean and consistent". Nobody evaluates the app itself.
- Deploying the app or Storybook anywhere other than Chromatic's built-in publishing.
- Chromatic's paid-in-snapshots accessibility tests (each one costs an extra snapshot). Accessibility runs in Vitest instead.

## Anti-goals (would make it a failure even if it works)

- Tool-hoarding: two tools doing the same job with no stated reason.
- Flaky visual diffs (animations, web fonts, dates, random data) that make the demo PR look noisy.
- A repo too big to explain in an interview, or that takes weeks to finish.

## Constraints

- Stack: React + TypeScript + Vite (her call). Storybook 10 (current major), with `@storybook/addon-vitest`, `@storybook/addon-a11y`, `@chromatic-com/storybook`.
- Playwright with `@chromatic-com/playwright` (swap the `test`/`expect` import; Chromatic archives the page per test; `npx chromatic --playwright` uploads).
- Chromatic links one project per repo for Storybook. The Playwright snapshots need a **second Chromatic project** in the same repo (Chromatic's sub-project setup), so two project tokens.
- Chromatic free plan: 5,000 snapshots/month, Chrome only. Expected use is ~30 snapshots per build (≈25 stories + ≈5 e2e), so roughly 160 full builds a month before TurboSnap; ample.
- She has to create the Chromatic account/projects and add the two tokens as GitHub secrets herself.
- Every PR needs her standard description: what changed, what problem it solves, how to test locally, risk.
- Repo is public under `ksycz`.

## Approaches considered

**A. Playwright for user flows (functional only), Chromatic for components.** Clear split and simple Playwright. But visual coverage stops at the component level; a broken page layout goes unnoticed.

**B. Same as A, plus Chromatic captures snapshots from the Playwright tests. — chosen.** One place (Chromatic) to review both component and page-level visual changes, one approval step. Most likely how a team using all three tools wires them together, and it shows Chromatic knowledge beyond the basics. Costs: a second Chromatic project, more snapshots per build, slightly more setup.

**C. Playwright's built-in `toHaveScreenshot()` next to Chromatic.** Rejected: two visual baselines for the same UI, OS-dependent screenshot flakiness, and invites "why both?" in an interview.

Katarzyna picked B.

## The design

### App (my call — easy to change)

A one-page **workshop booking** app: a list of upcoming workshops and a form to book a seat. Chosen because it naturally produces the states worth testing (empty list, sold-out item, form validation errors, success confirmation) without overlapping her existing "demo shop" repo.

Components (in `src/components/`, each with `Component.tsx` + `Component.stories.tsx`):

| Component | States worth a story |
|---|---|
| Button | primary, secondary, disabled, loading |
| TextField | default, with value, error, disabled |
| Select | default, selected, error |
| Badge | "seats left", "few seats", "sold out" |
| WorkshopCard | available, few seats, sold out |
| Modal | open with content (confirmation) |
| Alert | success, error |

Page: `BookingPage` — list of `WorkshopCard`s plus a booking form (name, email, workshop select). Submitting valid data opens the confirmation `Modal`; invalid data shows field errors; a sold-out workshop can't be selected. Data comes from a static TS module; "submit" is a fake async call with a fixed short delay.

`BookingPage` has **no stories** (my call). Page-level look belongs to Playwright + Chromatic; stories stop at components. This keeps one owner per layer, so there's no "why both?" and the demo PR's page diff clearly comes from Playwright. Page states such as "empty list" are reached in Playwright through a query param (e.g. `?workshops=none`).

Determinism: no `Date.now()`/random in rendered output, fixed data, self-hosted or system fonts, animations off in Storybook and Playwright snapshots.

### Testing split

| Layer | Tool | What it proves |
|---|---|---|
| Component look | Chromatic on stories | every state renders as approved |
| Component behaviour | `play` functions via Vitest addon | clicks, typing, validation, disabled states work |
| Accessibility | a11y addon via Vitest | no axe violations in any story (fails CI) |
| User flows | Playwright e2e on the running app | booking succeeds, validation blocks bad input, sold out can't be booked |
| Page look | Chromatic snapshots from Playwright | the composed page and its key states look as approved |

Playwright: 3–4 tests (happy-path booking, validation errors, sold-out workshop, maybe empty state via a query param or route). Chromatic snapshots are taken automatically at the end of each test; add explicit `takeSnapshot` only for mid-flow states (e.g. modal open).

### CI (GitHub Actions)

Triggered on pull requests and pushes to `main`.

1. **`ci.yml`** — install, lint, typecheck, run Storybook tests through Vitest (interaction + a11y), build the app.
2. **`chromatic.yml`** — build Storybook and upload with `chromaui/action` using `CHROMATIC_PROJECT_TOKEN`, TurboSnap on (`onlyChanged`). Chromatic posts its own "UI Tests" / "UI Review" status checks on the PR.
3. **`e2e.yml`** — start the app, run Playwright (Chromium only), upload the Playwright HTML report as an artifact, then upload the archives with `chromaui/action` (`playwright: true`) using `CHROMATIC_PLAYWRIGHT_TOKEN`.

Merge gate (my call): branch protection on `main` requires the `ci` and `e2e` jobs plus Chromatic's **UI Tests** check from both Chromatic projects. Chromatic jobs use `exitZeroOnChanges: true` so the GitHub job itself stays green; the Chromatic check is what stays pending until she accepts the changes in Chromatic. Changes on `main` are auto-accepted as the new baseline. When building, PRs are opened and their links handed over without waiting for checks or approvals; accepting visual changes is always her step.

### Demo of a caught regression

After everything is green on `main`, open one PR that changes a shared style (e.g. a colour token or `Button` padding). Expected: Chromatic flags changed stories across several components and the changed page snapshots. Keep the PR open (not merged), link it from the README with a short "what you'll see" note.

### README

- One paragraph: what this repo shows.
- The testing-split table above, plus one line on why not Playwright screenshots.
- Links: published Storybook, Chromatic builds, the demo PR.
- How to run everything locally.
- Notes on flake prevention (animations, fonts, data) and snapshot cost (TurboSnap).

## Deadline and cut order

Must be finished by **Sunday 15 Nov 2026, evening** (about a day of work). The Playwright → Chromatic page snapshots are **core**, not a stretch goal, because the target company uses Playwright.

Milestones, in order, each one a PR that leaves `main` green and demo-able:
1. App + components + stories + Storybook published to Chromatic (with `chromatic.yml`).
2. `play` interaction tests + a11y, run in `ci.yml`.
3. Playwright e2e + Chromatic Playwright project (`e2e.yml`).
4. README + the demo regression PR.

If time runs short, cut in this order: the `Select` component (use a native select styled inside `TextField`'s look), TurboSnap, branch protection (describe it in the README instead), the "few seats" states. Never cut: Chromatic on stories, interaction tests, Playwright + Chromatic snapshots, the demo PR, the README.

## Left to the builder

- Exact repo name (proposal: `storybook-chromatic-ui-testing`).
- Styling approach (CSS modules or plain CSS with tokens as CSS variables — no UI library, so the components are hers).
- Lint/format setup, package manager (npm unless there's a reason otherwise).
- Exact Chromatic action options (`exitZeroOnChanges`, `autoAcceptChanges` on `main`, etc.), following Chromatic's docs.
- How the e2e job serves the app (Vite preview vs dev server via Playwright `webServer`).
- Order of milestones/PRs.
