-include .env
export

KIND_CLUSTER ?= flagforge-local
KIND_CONFIG ?= infra/kind/cluster.yaml
KIND_NAMESPACE ?= flagforge
KIND_API_PORT ?= 3000
HELM_RELEASE ?= flagforge-api
HELM_CHART ?= charts/flagforge-api
HELM_VALUES ?= charts/flagforge-api/values-local.yaml
AWS_IAC_DIR ?= infra/aws
AWS_IAC_MODULE_DIR ?= infra/aws/modules/foundation

.PHONY: dev db-up db-test-up db-migrate test test-unit test-postgres build docker-build compose-up observability-up smoke-health smoke-gateway smoke-prometheus smoke-grafana kind-create kind-delete kind-namespace kind-load-image kind-postgres kind-postgres-wait kind-helm-deploy kind-api-port-forward kind-smoke-ready iac-aws-fmt-check iac-aws-validate typecheck lint format-check verify openspec-validate

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

observability-up:
	docker compose up -d app prometheus grafana

smoke-health:
	curl --fail http://localhost:$${PORT:-3000}/health

smoke-gateway:
	curl --fail http://localhost:$${KONG_PROXY_PORT:-8000}/health

kind-create:
	kind create cluster --name $(KIND_CLUSTER) --config $(KIND_CONFIG)

kind-delete:
	kind delete cluster --name $(KIND_CLUSTER)

kind-namespace:
	kubectl create namespace $(KIND_NAMESPACE) --dry-run=client -o yaml | kubectl apply -f -

kind-load-image:
	kind load docker-image flagforge-api:local --name $(KIND_CLUSTER)

kind-postgres: kind-namespace
	kubectl -n $(KIND_NAMESPACE) apply -f infra/kind/postgres.yaml

kind-postgres-wait:
	kubectl -n $(KIND_NAMESPACE) rollout status statefulset/postgres --timeout=120s

kind-helm-deploy: kind-namespace
	helm upgrade --install $(HELM_RELEASE) $(HELM_CHART) --namespace $(KIND_NAMESPACE) -f $(HELM_VALUES)

kind-api-port-forward:
	kubectl -n $(KIND_NAMESPACE) port-forward svc/$(HELM_RELEASE) $(KIND_API_PORT):3000

kind-smoke-ready:
	curl --fail http://localhost:$(KIND_API_PORT)/readyz

iac-aws-fmt-check:
	tofu fmt -check -recursive $(AWS_IAC_DIR)/modules
	terragrunt hcl format --check --working-dir $(AWS_IAC_DIR)

iac-aws-validate:
	tofu -chdir=$(AWS_IAC_MODULE_DIR) init -backend=false
	tofu -chdir=$(AWS_IAC_MODULE_DIR) validate

smoke-prometheus:
	curl --fail --silent "http://localhost:$${PROMETHEUS_PORT:-9090}/api/v1/query?query=up%7Bjob%3D%22flagforge-api%22%7D" | node -e 'let d = ""; process.stdin.on("data", (c) => d += c).on("end", () => { const body = JSON.parse(d); const isUp = body.status === "success" && body.data?.result?.some((series) => series.value?.[1] === "1"); if (!isUp) { console.error("flagforge-api Prometheus target is not UP"); process.exit(1); } });'

smoke-grafana:
	curl --fail http://localhost:$${GRAFANA_PORT:-3001}/api/health
	curl --fail --silent http://localhost:$${GRAFANA_PORT:-3001}/api/dashboards/uid/flagforge-local-overview >/dev/null

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
