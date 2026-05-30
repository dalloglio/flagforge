## 1. Local Verification Scripts

- [x] 1.1 Add a `format:check` npm script that runs Prettier without rewriting files
- [x] 1.2 Add a `verify` npm script that runs typecheck, lint, format check, tests, and strict OpenSpec validation
- [x] 1.3 Add a CI-oriented verification script or workflow command path that runs strict OpenSpec validation with JSON output

## 2. CI Workflow

- [x] 2.1 Update GitHub Actions to run the CI quality gates after `npm ci`
- [x] 2.2 Ensure CI includes `npx --yes @fission-ai/openspec@1.3.1 validate --all --strict --json` directly

## 3. Repository Guidance

- [x] 3.1 Update repository instructions to document `npm run verify`
- [x] 3.2 Add guidance that agents run `npm run verify` before considering implementation complete
- [x] 3.3 Add guidance that agents fix only verification failures directly related to the current change

## 4. Validation

- [x] 4.1 Run `npm run verify`
- [x] 4.2 Fix only failures directly related to this change
- [x] 4.3 Run `openspec validate add-verification-harness --strict`
