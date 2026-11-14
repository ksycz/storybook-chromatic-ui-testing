# Storybook + Chromatic + Playwright UI testing showcase

[![CI](https://github.com/ksycz/storybook-chromatic-ui-testing/actions/workflows/ci.yml/badge.svg)](https://github.com/ksycz/storybook-chromatic-ui-testing/actions/workflows/ci.yml)
[![Chromatic (Storybook)](https://github.com/ksycz/storybook-chromatic-ui-testing/actions/workflows/chromatic.yml/badge.svg)](https://github.com/ksycz/storybook-chromatic-ui-testing/actions/workflows/chromatic.yml)
[![E2E](https://github.com/ksycz/storybook-chromatic-ui-testing/actions/workflows/e2e.yml/badge.svg)](https://github.com/ksycz/storybook-chromatic-ui-testing/actions/workflows/e2e.yml)

A small workshop-booking app (React, TypeScript, Vite) built to show a complete UI testing workflow: components tested in isolation in Storybook, user flows tested end to end with Playwright, and every visual change reviewed and approved in Chromatic on the pull request. Everything runs in GitHub Actions.

## What is tested where

| What | Tool | What it proves |
|---|---|---|
| How a component looks | Chromatic on Storybook stories | Every state (variants, disabled, loading, error, sold out) renders as approved |
| How a component behaves | Storybook `play` functions, run with Vitest | Clicks, typing, validation wiring, disabled states, modal focus and Escape |
| Accessibility | Storybook a11y addon (axe), run with Vitest | No violations in any story; one fails the run |
| User flows | Playwright | Booking works, validation blocks bad input, sold-out workshops cannot be booked, double submit books once |
| How the whole page looks | Chromatic snapshots taken from the Playwright tests | The composed page and its key states look as approved |

**Why the page has no stories:** each layer has one owner. Stories cover components, Playwright covers the page, and Chromatic reviews the look of both in one place.

**Why no Playwright `toHaveScreenshot()`:** it would be a second visual baseline for the same UI, tied to the operating system that produced it. Chromatic already reviews the pages.

## The pipelines

Three workflows run on every pull request and on pushes to `main`:

- `ci`: lint (oxlint), typecheck, Storybook tests (interaction and accessibility) and unit tests with Vitest, then the build.
- `chromatic-storybook`: publishes Storybook to Chromatic and snapshots the stories. TurboSnap limits it to stories affected by the change.
- `e2e`: runs the Playwright tests, keeps the HTML report as an artifact, then uploads the page archives to a second Chromatic project.

Chromatic jobs do not fail on visual changes. The Chromatic status check on the PR stays pending until someone accepts or rejects the changes, and accepted changes on `main` become the new baseline. The intended merge gate is: `ci`, `e2e` and both Chromatic checks.

## See it catch a regression

[The demo pull request](https://github.com/ksycz/storybook-chromatic-ui-testing/pull/4) changes the primary colour and a button's padding. All functional tests still pass, but Chromatic shows the difference both at component level and on the full page.

## Run it locally

```bash
npm ci
npx playwright install chromium
npm run storybook   # component explorer at http://localhost:6006
npm test            # unit tests + every story as a test (interaction + a11y)
npm run e2e         # builds the app, serves it, runs the Playwright tests
```

To upload to Chromatic yourself, create a project at [chromatic.com](https://www.chromatic.com) and run `npx chromatic --project-token=<token>` (Storybook) or `npx chromatic --playwright --project-token=<token>` (after `npm run e2e`). In CI the tokens are the repository secrets `CHROMATIC_PROJECT_TOKEN` (Storybook project) and `CHROMATIC_PLAYWRIGHT_TOKEN` (Playwright project).

## Keeping visual tests stable

- No web fonts (system font stack), so rendering does not depend on a font loading.
- Animations and transitions are switched off globally.
- No dates, random values or locale formatting in rendered output; all data is fixed.
- Playwright tests end in a state that is already visible (they assert before the snapshot is taken).
- Chromatic renders in its own cloud browser, so snapshots do not vary with the machine that ran the tests.

## Snapshot cost

Chromatic's free plan includes 5,000 snapshots per month. One full build here is 21 stories plus 8 page snapshots. TurboSnap skips stories a change cannot affect, so most pull requests use far fewer.

## Design and plan

The design and the implementation plan this was built from are in [`docs/superpowers/`](docs/superpowers/).
