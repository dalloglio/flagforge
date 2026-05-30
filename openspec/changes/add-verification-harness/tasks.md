## 1. Local Verification Scripts

- [ ] 1.1 Add a `format:check` npm script that runs Prettier without rewriting files
- [ ] 1.2 Add a `verify` npm script that runs typecheck, lint, format check, tests, and strict OpenSpec validation
- [ ] 1.3 Add a CI-oriented verification script or workflow command path that runs strict OpenSpec validation with JSON output

## 2. CI Workflow

- [ ] 2.1 Update GitHub Actions to run the unified CI verification path after `npm ci`
- [ ] 2.2 Ensure CI includes `openspec validate --all --strict --json` directly or through the CI verification script

## 3. Repository Guidance

- [ ] 3.1 Update repository instructions to document `npm run verify`
- [ ] 3.2 Add guidance that agents run `npm run verify` before considering implementation complete
- [ ] 3.3 Add guidance that agents fix only verification failures directly related to the current change

## 4. Validation

- [ ] 4.1 Run `npm run verify`
- [ ] 4.2 Fix only failures directly related to this change
- [ ] 4.3 Run `openspec validate add-verification-harness --strict`
