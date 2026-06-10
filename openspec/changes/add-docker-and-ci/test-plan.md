# Test Plan: add-docker-and-ci

## Scope

Este plano cobre a validacao da fundacao local e CI para executar FlagForge com PostgreSQL, migrations explicitas, build TypeScript, imagem Docker de producao, Docker Compose e GitHub Actions com PostgreSQL service container.

O foco e provar que:

- `npm run verify` continua sendo um gate host-only, sem exigir Docker ou PostgreSQL;
- scripts npm e targets Makefile expõem build, migrations, testes unitarios, testes de integracao PostgreSQL, Docker build, Compose app e smoke check;
- migrations preparam um banco PostgreSQL limpo e falham de forma clara quando a configuracao ou historico estiver invalido;
- Docker Compose sobe PostgreSQL e API com defaults locais nao secretos, mantendo migrations como passo explicito;
- a imagem Docker compila TypeScript, executa `node dist/src/server.js`, usa dependencias de runtime de producao e roda sem root;
- CI executa gates nomeados com PostgreSQL service container, migrations antes dos testes de integracao, build da aplicacao e Docker build sem publish.

Fora de escopo: registry publish, deploy, Kubernetes, Helm, kind, Argo CD, Kong, OpenAPI, observabilidade, autenticacao, autorizacao, tenancy, SDKs e mudancas no contrato publico da API.

## Test levels

### Unit tests

- Validar que scripts em `package.json` existem para `build`, `db:migrate`, testes unitarios, testes PostgreSQL e `verify`.
- Validar que `npm run verify` chama apenas checks host-only: typecheck, lint, format check, unit tests e OpenSpec strict validation.
- Validar parsing de configuracao PostgreSQL ja existente para `DATABASE_URL` e `TEST_DATABASE_URL`, incluindo URL ausente, invalida e mensagens sem segredo.
- Validar que testes unitarios nao dependem de Docker, Compose ou PostgreSQL real.
- Validar que helpers de migracao preservam ordem, idempotencia e falha de checksum divergente quando cobertos em unidade.

### Integration tests with PostgreSQL

- Subir PostgreSQL real via Docker Compose ou service equivalente, aplicar `npm run db:migrate` e executar o script de integracao PostgreSQL.
- Confirmar que `TEST_DATABASE_URL` aponta para o banco de teste e nao depende do banco de desenvolvimento manual.
- Confirmar que flags, avaliacao e audit log continuam persistindo e lendo dados reais depois das migrations.
- Confirmar que a suite de integracao falha de forma diagnostica quando migrations nao foram aplicadas.
- Confirmar que a suite de integracao falha de forma diagnostica quando PostgreSQL nao esta acessivel ou `TEST_DATABASE_URL` esta invalido.

### Migration tests

- Banco limpo: executar `npm run db:migrate` e confirmar sucesso.
- Reexecucao: executar `npm run db:migrate` duas vezes contra o mesmo banco e confirmar idempotencia.
- Ordem: confirmar que migrations sao aplicadas na ordem esperada pelo runner.
- Historico: confirmar que a tabela de controle de migrations registra nome e checksum conforme a implementacao.
- Divergencia: simular checksum divergente em banco de teste controlado e confirmar falha antes de aplicar novas migrations.
- Configuracao invalida: executar migration sem `DATABASE_URL` ou com URL invalida e confirmar falha clara sem expor senha.

### Docker and Compose checks

- Executar o Docker build documentado a partir da raiz do repositorio e confirmar imagem criada com sucesso.
- Inspecionar ou testar a imagem para confirmar que o comando de runtime usa `node dist/src/server.js`, nao `tsx`, watch mode ou comando de desenvolvimento.
- Confirmar que o processo da API no container roda como usuario nao-root.
- Confirmar que `.dockerignore` exclui `node_modules`, `dist`, `.git`, arquivos `.env` locais e outros artefatos fora do contexto necessario.
- Subir `docker compose up -d postgres`, aguardar health check e aplicar migrations explicitamente pelo comando canonico.
- Subir o servico `app` do Compose depois das migrations e confirmar que ele usa `DATABASE_URL` apontando para o servico PostgreSQL.
- Confirmar que o app do Compose nao executa migrations automaticamente durante startup.
- Executar smoke check contra `/health` pela porta documentada no host.
- Derrubar o stack e volumes de teste conforme documentacao, sem exigir cleanup destrutivo para dados fora do ambiente local.

### CI checks

- Confirmar que GitHub Actions usa `npm ci` para instalacao.
- Confirmar que o workflow possui PostgreSQL service container com credenciais nao secretas de teste e health check.
- Confirmar ordem dos steps: OpenSpec, lint, format check, typecheck, migrations, unit tests, PostgreSQL integration tests, build e Docker build.
- Confirmar que migrations rodam antes dos testes de integracao PostgreSQL.
- Confirmar que `TEST_DATABASE_URL` no CI aponta para o service container.
- Confirmar que o Docker build roda sem publicar imagem em registry.
- Confirmar que steps chamam scripts npm canonicos ou comandos Docker documentados, sem duplicar internals de Vitest, TypeScript ou migrations no YAML.

### Contract and regression checks

- Reexecutar a suite API/domain existente para provar que o change nao alterou status codes, error payloads, avaliacao deterministica ou audit log.
- Validar OpenSpec do change e validacao strict global.
- Confirmar que README, `.env.example` e runbook local documentam os mesmos nomes de variaveis e comandos.
- Confirmar que Makefile permanece thin wrapper sobre npm, OpenSpec, Docker e Docker Compose.

## Cases

### Happy paths

- `npm run build` compila o projeto para `dist/` e termina com exit code `0`.
- `npm run test:unit` executa somente testes que nao exigem PostgreSQL.
- `docker compose up -d postgres` sobe PostgreSQL com defaults locais documentados.
- `DATABASE_URL=postgres://... npm run db:migrate` prepara um banco limpo.
- `TEST_DATABASE_URL=postgres://... npm run test:postgres` executa a suite de integracao PostgreSQL.
- `docker build -t flagforge:local .` cria a imagem da API.
- `docker compose up -d app` inicia a API depois das migrations explicitas.
- O smoke check documentado contra `http://localhost:<PORT>/health` retorna sucesso.
- CI executa todos os gates nomeados com PostgreSQL service container e Docker build sem publish.

### Edge cases

- `npm run verify` passa em ambiente sem Docker daemon e sem PostgreSQL rodando.
- `TEST_DATABASE_URL` ausente usa o comportamento documentado pela implementacao, sem apontar acidentalmente para producao.
- Reexecutar migrations contra banco ja migrado nao altera schema nem falha.
- Docker Compose aguarda PostgreSQL healthy antes de iniciar a API.
- Porta local customizada por `PORT` permanece documentada e nao quebra o smoke check quando usada conforme instrucoes.
- `.env.example` contem apenas defaults locais nao secretos e nao e copiada para dentro da imagem.
- Docker build nao depende de `node_modules` local nem de `dist/` preexistente.
- CI em runner limpo nao depende de cache, volume local ou banco previamente migrado.

### Expected failures

- Migration sem `DATABASE_URL` valido falha com mensagem acionavel e sem expor segredo.
- Migration com PostgreSQL indisponivel falha antes dos testes de integracao.
- PostgreSQL integration test sem banco acessivel falha claramente e nao deve ser mascarado como teste unitario.
- PostgreSQL integration test sem migrations aplicadas falha por schema ausente ou erro equivalente, indicando que o gate de migration foi pulado.
- Checksum divergente de migration ja aplicada falha antes de continuar.
- Docker build falha se o Dockerfile depender de `dist/` local, `node_modules` local ou comando de desenvolvimento ausente no runtime.
- Container falha ou teste de inspecao falha se o processo rodar como root.
- Compose app startup falha se `DATABASE_URL` nao apontar para o servico PostgreSQL.
- Smoke check `/health` falha se app nao estiver expondo a porta documentada ou se a API nao iniciar.
- CI falha se migrations rodarem depois dos testes PostgreSQL, se `TEST_DATABASE_URL` apontar para host incorreto ou se Docker build tentar publicar imagem.

## Data

### Environment values

- Local runtime and migration URL: `DATABASE_URL=postgres://flagforge:flagforge@localhost:5432/flagforge`.
- Local integration URL: `TEST_DATABASE_URL=postgres://flagforge:flagforge@localhost:5432/flagforge_test` ou valor equivalente documentado se o Compose usar um unico banco local.
- Compose app URL: `DATABASE_URL` dentro do container deve usar o hostname do servico PostgreSQL, nao `localhost`.
- API port: `PORT=3000` como default local nao secreto, salvo se a implementacao documentar outro valor.

### Test fixtures

- Usar fixtures de flags e audit log ja cobertas pela suite existente para provar que Docker/CI nao mudam comportamento funcional.
- Usar banco PostgreSQL limpo por job de CI.
- Em local, documentar limpeza de volume ou database de teste quando os dados persistentes interferirem na reproducibilidade.
- Nao usar credenciais reais, secrets pessoais ou URLs de producao em `.env.example`, Compose, testes ou CI.

## Automation

### Focused local commands

- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run test:unit`
- `npm run test:postgres`
- `npm run build`
- `npm run db:migrate`
- `openspec validate add-docker-and-ci --strict`

### Local Docker Compose validation

- `docker compose up -d postgres`
- `npm run db:migrate`
- `npm run test:postgres`
- `docker build -t flagforge:local .`
- `docker compose up -d app`
- `curl -fsS http://localhost:3000/health`
- `docker compose down`

Os comandos finais podem ser expostos por Makefile, mas devem permanecer thin wrappers sobre os comandos canonicos acima ou equivalentes documentados.

### Expected gates

- Host-only completion gate: `npm run verify`.
- Full local platform validation when Docker is available: PostgreSQL Compose startup, migrations, PostgreSQL integration tests, Docker build, Compose app startup and `/health` smoke check.
- CI gate: OpenSpec strict validation, lint, format check, typecheck, migrations against service PostgreSQL, unit tests, PostgreSQL integration tests, build and Docker build.

### Commands of verification

- `npm run verify`
- `openspec validate add-docker-and-ci --strict`
- `openspec validate --all --strict`
- `docker compose up -d postgres`
- `npm run db:migrate`
- `npm run test:postgres`
- `npm run build`
- `docker build -t flagforge:local .`
- `docker compose up -d app`
- `curl -fsS http://localhost:3000/health`
- `docker compose down`

## Residual risk

- Local Docker validation depends on Docker daemon availability; environments without Docker can only validate scripts, docs, specs and host-only tests.
- Compose smoke checks prove local wiring, not production deployment, registry publishing or Kubernetes behavior.
- CI service container proves a clean PostgreSQL job database, but not managed database behavior, backups, restore, network policies or long-running data growth.
- Non-root image validation depends on the implemented inspection method; a build-only CI check may need a focused container run or image inspect step for stronger confidence.
- This plan assumes the current public API and persistence semantics remain unchanged; any API behavior change requires updated OpenSpec specs and API tests.

## Blockers

None.

## Suggestions

- Add a Makefile target that runs the full optional local platform validation sequence when Docker is available.
- Add a lightweight Docker image inspection check in CI to assert the configured user and runtime command, not just successful build.
- Add a documented cleanup command for local Compose volumes used by repeatable migration and integration checks.
- Keep PostgreSQL integration tests tagged or scripted separately so unit-test failures are not confused with missing local services.

## Recommendation

Proceed with plan.
