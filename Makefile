.PHONY: dev db-up db-test-up db-migrate test test-unit test-postgres build docker-build compose-up smoke-health typecheck lint format-check verify openspec-validate

dev:
	npm run dev

db-up:
	docker compose up -d postgres

db-test-up:
	docker compose up -d postgres-test

db-migrate:
	npm run db:migrate

test:
	npm test

test-unit:
	npm run test:unit

test-postgres:
	npm run test:postgres

build:
	npm run build

docker-build:
	docker build -t flagforge-api:local .

compose-up:
	docker compose up -d app

smoke-health:
	curl --fail http://localhost:$${PORT:-3000}/health

typecheck:
	npm run typecheck

lint:
	npm run lint

format-check:
	npm run format:check

verify:
	npm run verify

openspec-validate:
	openspec validate --all --strict
