# Test Plan: add-postgresql-persistence

## Scope

Este plano cobre a validacao de persistencia PostgreSQL para flags, eventos de auditoria, migracoes, configuracao local e compatibilidade da API publica do FlagForge.

O foco e provar que:

- flags e audit events usam PostgreSQL no runtime padrao;
- migracoes preparam um banco vazio de forma repetivel;
- flags criadas e atualizadas sobrevivem a novo ciclo de repositorio ou aplicacao;
- avaliacao preserva regras, rollout deterministico e motivos de resposta apos persistencia;
- audit events sao append-only, duraveis, ordenados do mais antigo para o mais novo e filtraveis por `flagKey`;
- mutacoes de flag e append de auditoria sao atomicos;
- erros de validacao, chave duplicada, recurso ausente e indisponibilidade do PostgreSQL nao alteram os contratos existentes nem caem silenciosamente para memoria.

Fora de escopo: Kubernetes, cloud/RDS, Helm, Argo CD, Kong, autenticacao, autorizacao, multi-tenancy, SDKs e migracao de dados de processos em memoria anteriores.

## Test levels

### Unit tests

- Validar parsing de configuracao de banco: `DATABASE_URL` presente, ausente, invalida e sanitizacao de diagnosticos sem expor segredo.
- Validar o runner de migracoes em componentes isolados: ordenacao lexicografica, calculo de checksum, deteccao de migracao ja aplicada e erro em checksum divergente.
- Validar contratos async dos repositorios usando doubles em memoria explicitos, sem alegar durabilidade.
- Validar hidratacao de linhas PostgreSQL para objetos de dominio, incluindo reparse por schemas de flag, regras e rollout.
- Validar que domain, evaluator e audit event construction nao importam PostgreSQL, pool, transaction client ou Express.
- Validar use cases de create/update/read/list/evaluate/audit-log com repositorios fake: sucesso, duplicidade, not-found, payload invalido e ausencia de audit event em rejeicoes.
- Validar que snapshots de auditoria sao clonados e nao compartilham referencia mutavel com flags retornadas.

### Integration tests with real PostgreSQL

- Subir PostgreSQL real via Docker Compose ou harness equivalente, aplicar migracoes reais e rodar testes contra `DATABASE_URL` de teste.
- Criar flag com regras e rollout, descartar a instancia do repositorio/app, criar nova instancia contra o mesmo banco e ler a flag com o mesmo shape publico.
- Atualizar flag existente, reiniciar repositorio/app e confirmar que `GET /flags/{key}`, `GET /flags` e avaliacao usam o estado atualizado.
- Persistir flags com regras aninhadas e rollout, reiniciar e confirmar equivalencia estrutural dos campos `rules` e `rollout`.
- Registrar audit events de create e update, reiniciar e confirmar IDs, timestamps ISO, action, `flagKey`, `before` e `after`.
- Confirmar ordenacao estavel de audit events por ordem de append, inclusive quando timestamps coincidirem.
- Confirmar filtro `GET /audit-log?flagKey={key}` com eventos de multiplas flags antes e depois de restart.
- Confirmar atomia: create/update bem-sucedidos persistem flag e audit event juntos; duplicate-key, not-found e validation errors nao persistem audit event.
- Confirmar update concorrente com bloqueio de linha ou fluxo atomico equivalente, verificando que cada audit event tem `before` e `after` coerentes com a mutacao commitada.
- Confirmar que indisponibilidade do PostgreSQL ou configuracao ausente falha claramente e nao usa repositorios em memoria.

### Migration tests

- Banco vazio: aplicar migracoes e verificar existencia de tabelas de flags, audit events e historico de migracoes.
- Reexecucao: rodar o runner duas vezes e confirmar que migracoes ja aplicadas sao reconhecidas e nao reaplicadas.
- Divergencia de checksum: alterar uma migracao ja registrada em banco de teste controlado e confirmar falha clara antes de novas alteracoes.
- Ordem: confirmar aplicacao em ordem lexicografica por nome do arquivo.
- Dados validos: inserir/ler flag com escalares, `rules` JSONB, `rollout` JSONB e audit snapshots JSONB.
- Restricoes: confirmar unicidade de key de flag, campos obrigatorios de audit event e ordenacao por sequencia de append.

### API tests

- `POST /flags`: `201` com payload valido simples; `201` com rollout valido; `400` com payload invalido; `400` com rollout invalido; `409` com key duplicada.
- `GET /flags`: `200` com array vazio em banco novo; `200` com flags persistidas antes do ciclo atual.
- `GET /flags/{key}`: `200` para flag persistida; `404` para ausente.
- `PATCH /flags/{key}`: `200` para update parcial valido; `200` para update de rollout; `400` para payload invalido; `400` para rollout invalido; `404` para ausente.
- `POST /flags/{key}/evaluate`: `200` para flag persistida enabled/disabled/rules/rollout; `400` para contexto invalido; `404` para flag ausente.
- `GET /audit-log`: `200` com array vazio; `200` ordenado oldest-to-newest depois de create/update; `400` para `flagKey` invalido.
- `GET /audit-log?flagKey={key}`: `200` apenas com eventos da flag solicitada, inclusive apos restart.
- Para todos os erros de cliente e not-found: manter body JSON com `error.code` e `error.message`.

### Contract and regression checks

- Reexecutar a suite existente de API, evaluator e audit-log apos converter contratos para async, sem enfraquecer asserts de status code, payload e motivos de avaliacao.
- Confirmar que shape publico de flag, evaluation result e audit event nao muda com PostgreSQL.
- Confirmar que o comportamento de rollout continua deterministico para o mesmo key/context antes e depois de restart.
- Confirmar que sucesso de mutacao continua sendo o unico gatilho para audit event.
- Confirmar que testes que nao validam durabilidade ainda injetam doubles em memoria explicitamente.

## Cases

### Happy paths

- Criar `checkout-redesign` enabled com descricao, ler por key, listar e avaliar como `true`.
- Criar `beta-banner` disabled, ler apos restart e avaliar como `false`.
- Criar `regional-offer` com regra `country equals BR`, persistir, reiniciar e avaliar contexto correspondente e nao correspondente.
- Criar `gradual-rollout` com `rollout.percentage` `50` e `attribute` `userId`, avaliar o mesmo contexto antes e depois de restart e comparar `enabled` e `reason`.
- Atualizar descricao, enabled, rules e rollout de uma flag existente e confirmar persistencia apos novo ciclo.
- Listar audit log apos create e update e confirmar `flag_created` seguido por `flag_updated`.

### Edge cases

- Rollout `0` retorna `not_in_rollout` quando o atributo existe.
- Rollout `100` retorna `in_rollout` quando o atributo existe.
- Rollout sem atributo no contexto retorna `missing_rollout_attribute`.
- Regra nao correspondente com rollout configurado retorna `no_matching_rule`.
- Timestamps iguais em audit events continuam ordenados pela sequencia de append.
- Snapshot antigo de create nao muda apos updates posteriores.
- Flag com `description` ausente/null, `rules` vazio e `rollout` ausente sobrevive a persistencia sem alterar shape esperado.
- Valores JSONB aninhados retornam como objetos/arrays equivalentes, nao strings serializadas.
- Dois updates concorrentes na mesma flag produzem audit snapshots coerentes e nenhum evento duplicado ou com `before` obsoleto.
- Banco indisponivel no startup e durante trabalho dependente de persistencia gera diagnostico claro sem segredo.

### Failure cases

- `POST /flags` duplicado retorna `409` e nao adiciona audit event.
- `POST /flags` invalido retorna `400` e nao adiciona flag nem audit event.
- `PATCH /flags/{key}` ausente retorna `404` e nao adiciona audit event.
- `PATCH /flags/{key}` invalido retorna `400` e nao altera flag nem audit event.
- `POST /flags/{key}/evaluate` ausente retorna `404`.
- `GET /audit-log?flagKey=` ou key invalida retorna `400`.
- Migracao com checksum divergente falha antes de aplicar qualquer migracao posterior.
- Runtime sem configuracao PostgreSQL falha em vez de criar repositorio em memoria.

## Data

### Fixture flags

- `checkout-redesign`: enabled `true`, descricao `"New checkout flow"`, sem rules/rollout.
- `beta-banner`: enabled `false`, descricao `"Beta banner"`.
- `regional-offer`: enabled `true`, rules com `country equals BR`.
- `gradual-rollout`: enabled `true`, rollout `{ "percentage": 50, "attribute": "userId" }`.
- `zero-rollout`: enabled `true`, rollout `{ "percentage": 0, "attribute": "userId" }`.
- `full-rollout`: enabled `true`, rollout `{ "percentage": 100, "attribute": "userId" }`.

### Evaluation contexts

- Matching regional context: `{ "country": "BR", "userId": "user-123" }`.
- Non-matching regional context: `{ "country": "US", "userId": "user-123" }`.
- Missing rollout attribute context: `{ "country": "BR" }`.
- Stable rollout contexts: fixed `userId` values selected during test implementation to cover included and excluded buckets deterministically.

### Database setup and reset

- Integration tests devem usar banco PostgreSQL real isolado de desenvolvimento manual.
- Cada arquivo ou caso de integracao deve limpar tabelas ou usar schema/database exclusivo para evitar acoplamento por ordem de execucao.
- Migracoes devem ser aplicadas pelo mesmo runner usado localmente, nao por schema especial apenas de teste.
- Dados de teste nao devem depender de hora atual para ordenacao; quando necessario, usar clock fixo e validar append sequence.

## Automation

### Focused commands

- `npm test -- --run test/evaluator.test.ts`
- `npm test -- --run test/app.test.ts`
- `npm test -- --run test/audit-log.test.ts`
- `npm test -- --run test/postgresql*.test.ts`
- `npm test -- --run test/migrations*.test.ts`
- `openspec validate add-postgresql-persistence --strict`

### Local PostgreSQL validation

- `docker compose up -d postgres`
- `npm run db:migrate`
- `npm run test:integration`
- `npm run verify`
- `openspec validate --all --strict`

Os nomes finais de scripts podem variar durante a implementacao, mas o plano exige comandos equivalentes para migracoes e testes de integracao PostgreSQL real.

### Expected gates

- TypeScript: `npm run typecheck` passa.
- Lint: `npm run lint` passa.
- Formatting: `npm run format:check` passa.
- Unit/API/integration tests: `npm test` e o script de integracao PostgreSQL passam com banco disponivel.
- OpenSpec: `openspec validate add-postgresql-persistence --strict` e `openspec validate --all --strict` passam.
- Gate completo: `npm run verify` passa com PostgreSQL disponivel.

## Residual risk

- Concorrencia real depende da implementacao exata do lock/SQL transacional; os testes devem cobrir o cenario, mas nao provam todos os interleavings possiveis.
- JSONB reparse protege o caminho da aplicacao, mas alteracoes manuais fora da API podem criar linhas invalidas; o comportamento esperado para linhas corrompidas deve falhar claramente.
- Testes locais com Docker Compose nao substituem validacao futura de RDS, rede, backup, restore ou operacao em Kubernetes.
- Performance e crescimento de tabelas nao sao criterios desta mudanca.

## Blockers

None.

## Suggestions

- Adicionar tag ou script dedicado para testes que exigem PostgreSQL real, evitando falhas confusas quando o banco nao estiver rodando.
- Criar helpers de fixture para flags, evaluation contexts e asserts de audit snapshots para reduzir duplicacao nos testes API e integracao.
- Incluir um teste que valida explicitamente que diagnosticos de erro nao contem senha ou connection string completa.
- Documentar no README ou guia local os comandos de subir banco, aplicar migracoes, rodar integracao e limpar volume local.

## Recommendation

Proceed with plan.
