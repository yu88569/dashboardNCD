# Repository Guidelines

## Project Structure & Module Organization
- Source lives in Apps Script-friendly fragments: `code.gs` holds backend logic, while HTML partials (`index.html`, `Header.html`, `Kpis.html`, `Charts.html`, `Table.html`, `Modals.html`) compose the dashboard.
- UI behavior is split between `Scripts.html` (public dashboard) and `AdminScripts.html` (restricted admin tools). `Styles.html` centralizes theme variables, layout rules, and responsive tweaks.
- `SessionExpired.html` and `Login.html` provide guarded entry points; keep them lightweight because they render before authentication completes.

## Build, Test, & Development Commands
- No bundler is required; edit `.gs`/`.html` files directly and sync to Google Apps Script.
- Recommended automation: `npx @google/clasp login` followed by `npx @google/clasp push` once you have a local `clasp.json` pointing at the Apps Script project.
- For manual updates, copy file contents into the Apps Script editor and redeploy via Deploy -> New deployment; note this is mandatory after each `code.gs` change.

## Coding Style & Naming Conventions
- Use two-space indentation for `.gs` and HTML templates; stay consistent with existing formatting.
- Server constants are ALL_CAPS (`SHEET_ID`, `CACHE_TTL_SECONDS`), while functions use `camelCase` (`maskName`, `getSession`).
- Prefer double quotes for strings and trailing commas only where Apps Script tolerates them; keep inline comments concise and bilingual when user-facing.
- In HTML partials, maintain the current pattern of including fragments via `HtmlService.createHtmlOutputFromFile(...)` to avoid breaking template injection.

## Testing Guidelines
- There is no automated suite; rely on Apps Script executions such as `testSession()` and `testUserSheet()` from `code.gs` to validate authentication and data connectivity.
- After pushing changes, exercise both `/` and `?page=admin` URLs, confirming login expiry, CSV import, and theme toggles; capture console logs via the Apps Script editor when diagnosing issues.
- Document manual test steps in PR descriptions so reviewers can replay them.

## Commit & Pull Request Guidelines
- Existing history favors short, imperative Thai summaries (for example, commit 358f25e); mirror that style or provide an English imperative if the change affects international collaborators.
- Group changes per feature or fix, keep commits scoped, and avoid bundling content edits with deployment exports.
- Pull requests should include: purpose, screenshots or Loom for UI changes, updated deployment URL if it changed, and explicit notes about required sheet structure or credentials.

## Deployment & Configuration
- Update `SHEET_ID`, `SHEET_NAME`, and `USER_SHEET_NAME` in `code.gs` before publishing; never hardcode secrets beyond sheet IDs.
- Ensure the `user` sheet contains current credentials and an optional amphoe (district) column referenced by the admin features.
- When changing session duration or cache TTLs, surface the adjustments in release notes to keep admins aware of behavior shifts.
