## 1. Scripts and Environment

- [ ] 1.1 Add a `build` npm script that compiles the TypeScript project to `dist/`.
- [ ] 1.2 Add or adjust npm test scripts so unit tests and PostgreSQL integration tests can run as separate commands.
- [ ] 1.3 Keep `db:migrate` as the canonical migration command for local and CI workflows.
- [ ] 1.4 Add `.env.example` with documented non-secret local values for `DATABASE_URL`, `TEST_DATABASE_URL`, and `PORT`.
- [ ] 1.5 Keep `npm run verify` focused on host-only checks that do not require Docker or PostgreSQL; expose PostgreSQL, build, Docker, and smoke checks through separate scripts or Makefile targets.

## 2. Docker Assets

- [ ] 2.1 Add a production multi-stage `Dockerfile` that uses an explicitly versioned Node Alpine base image, builds TypeScript, installs or prunes to production dependencies for the runtime stage, runs as a non-root user, and runs `node dist/src/server.js`.
- [ ] 2.2 Add `.dockerignore` entries for local dependencies, build output, Git metadata, local environment files, and other unnecessary build context.
- [ ] 2.3 Extend `docker-compose.yml` with an `app` service that builds the API image, depends on healthy PostgreSQL, configures `DATABASE_URL`, and exposes the API port.
- [ ] 2.4 Preserve the existing PostgreSQL Compose service with non-secret local defaults and a health check.
- [ ] 2.5 Keep migrations out of the app container startup path; document migration execution as an explicit prerequisite before starting the Compose app service.

## 3. Local Command Wrappers

- [ ] 3.1 Update the `Makefile` with thin targets for PostgreSQL startup, migrations, build, PostgreSQL integration tests, Docker image build, Compose app startup, and a local `/health` smoke check.
- [ ] 3.2 Keep existing Makefile quality targets as wrappers around the corresponding npm or OpenSpec commands.

## 4. CI Workflow

- [ ] 4.1 Update GitHub Actions to provide a PostgreSQL service container with non-secret test credentials and a health check.
- [ ] 4.2 Keep dependency installation through `npm ci`.
- [ ] 4.3 Keep strict OpenSpec validation as a direct CI step.
- [ ] 4.4 Run lint, format check, typecheck, migration, unit test, PostgreSQL integration test, build, and Docker build as named CI steps that call canonical repository scripts or documented Docker commands.
- [ ] 4.5 Ensure CI runs migrations before PostgreSQL integration tests and uses `TEST_DATABASE_URL` pointed at the service container.
- [ ] 4.6 Ensure CI builds the Docker image without publishing it to a registry.

## 5. Documentation

- [ ] 5.1 Update `README.md` with local install, database startup, explicit migrations, app startup, tests, build, Docker build, Compose app startup, `/health` smoke check, and verification commands.
- [ ] 5.2 Create `docs/runbooks/local-development.md` with the local Docker, PostgreSQL, migration, test, build, and troubleshooting workflow.
- [ ] 5.3 Document that Helm, kind, Argo CD, Kong, registry publishing, deployment, OpenAPI, and observability remain out of scope for this change.

## 6. Validation

- [ ] 6.1 Run focused checks for updated scripts and OpenSpec validation.
- [ ] 6.2 Run Docker build if Docker is available in the environment.
- [ ] 6.3 Run PostgreSQL migration and integration test checks if PostgreSQL or Docker Compose is available in the environment.
- [ ] 6.4 Run the documented `/health` smoke check against the Compose app service if Docker Compose is available in the environment.
- [ ] 6.5 Run `npm run verify` before marking implementation complete, and report any environment-limited checks that could not be run.
