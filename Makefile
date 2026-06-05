.PHONY: dev test typecheck lint format-check verify openspec-validate

dev:
	npm run dev

test:
	npm test

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
