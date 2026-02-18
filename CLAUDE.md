# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SigNoz is an open-source observability platform (APM, logs, traces, metrics, alerts) built on OpenTelemetry and ClickHouse. It has a Go backend and React/TypeScript frontend, with Community and Enterprise editions.

## Common Commands

### Backend (Go)

```bash
make go-run-community              # Run community edition backend
make go-run-enterprise             # Run enterprise edition backend
make go-build-community            # Build community binary
make go-build-enterprise           # Build enterprise binary
make go-test                       # Run all Go tests (with race detector)
go test -race ./pkg/some/package/... # Run tests for a specific package
make gen-mocks                     # Generate mocks using mockery
```

### Frontend (React/TypeScript)

```bash
cd frontend
yarn install                       # Install dependencies
yarn dev                           # Start dev server (localhost:3301)
yarn build                         # Production build
yarn lint                          # ESLint check
yarn lint:fix                      # ESLint auto-fix
yarn prettify                      # Prettier auto-format
yarn fmt                           # Prettier check
yarn test                          # Run all unit tests (Vitest)
yarn test:run                      # Run tests once (headless)
yarn test:coverage                 # Run tests with coverage (Vitest)
yarn generate:api                  # Regenerate API client from OpenAPI spec
```

### Local Development Environment

```bash
make devenv-up                     # Start ClickHouse + OTel Collector via Docker
make devenv-clickhouse             # Start only ClickHouse
make devenv-signoz-otel-collector  # Start only OTel Collector
```

Health checks: ClickHouse `http://localhost:8123/ping`, Backend `http://localhost:8080/api/v1/health`, Frontend `http://localhost:3301`

### Integration Tests (Python)

```bash
cd tests/integration
uv sync
uv run pytest --basetemp=./tmp/ -vv --reuse src/bootstrap/setup.py::test_setup  # Setup
uv run pytest --basetemp=./tmp/ -vv --reuse src/<suite>/                         # Run suite
```

Always use the `--reuse` flag. Test suites are in `tests/integration/src/` with numeric prefixes for ordering.

## Architecture

### Backend Structure

- **`cmd/community/`** and **`cmd/enterprise/`** — Entry points. Enterprise extends community with licensing, SAML/OIDC auth, OpenFGA authorization.
- **`pkg/`** — Core packages shared by both editions:
  - `apiserver/` — HTTP REST API server using Gin framework
  - `query-service/` — Query execution engine for ClickHouse
  - `telemetrystore/` — Abstraction over ClickHouse for telemetry data
  - `sqlstore/` — SQL operations (SQLite/PostgreSQL) for metadata via Bun ORM
  - `sqlmigration/` — Database schema migrations
  - `authn/` — Authentication (JWT, OAuth2)
  - `authz/` — Authorization
  - `modules/` — Pluggable modules (dashboard, role, organization)
  - `errors/` — Custom error types (use this instead of stdlib `errors`)
  - `flagger/` — Feature flags built on OpenFeature
  - `gateway/` — Request gateway
- **`ee/`** — Enterprise-only extensions (licensing, OIDC/SAML, OpenFGA, enterprise query-service)

### Frontend Structure

- **React 18 + TypeScript** with Webpack bundler
- **Ant Design** as primary UI component library, supplemented by Radix UI and `@signozhq/` design system packages
- **Redux** for global state, **React Query** for server state
- `src/api/` — Auto-generated API client (Orval from OpenAPI spec)
- `src/providers/` — Context providers (App, QueryBuilder, Dashboard, Theme, Timezone)
- `src/container/` — Page containers with business logic
- `src/components/` — Reusable UI components
- `src/hooks/` — Custom React hooks

### Key Patterns

**Handler pattern** (Go): Decode request → call module → render response. Register handlers in `signozapiserver` with `handler.New()` and `OpenAPIDef`. Run `go run cmd/enterprise/*.go generate openapi` to update the OpenAPI spec after adding endpoints.

**Provider pattern** (Go): Interface + Config + Implementation + Mock. Wiring goes through `pkg/signoz/config.go` → `pkg/signoz/provider.go` → `pkg/signoz/signoz.go`.

**SQL conventions**: Star schema with organizations as central entity. All tables need `id`, `created_at`, `updated_at`, `org_id`. Use `sqlstore.BunDBCtx(ctx)` for DB access, `sqlstore.RunInTxCtx()` for transactions. Migrations must be idempotent with no `Down` migrations and no `ON CASCADE` deletes.

**Endpoint design**: RESTful with pluralized resource names and versioning (e.g., `POST /v1/organizations`, `GET /v1/organizations/:id/users`). `me` endpoints are symlinks resolved from auth context.

## Code Conventions

### Go

- **Errors**: Use `pkg/errors` — never use stdlib `errors.New()` or `fmt.Errorf()`. Structure: `errors.New(typ, code, message)` with types like `TypeInvalidInput`, `TypeNotFound` and codes matching `^[a-z_]+$`.
- **Logging**: Use `slog` — never use `zap`. Use snake_case keys, key-value pairs only, static messages, pass context.
- **No print statements**: `fmt.Print*`, `print`, `println` are forbidden.
- **Linting**: golangci-lint is configured. The `pkg/query-service/` and `ee/query-service/` directories are excluded from some lint rules (legacy code).

### Frontend (TypeScript/React)

- **Imports**: Auto-sorted by `simple-import-sort` (react → external → `@/` → relative → styles)
- **Max 3 function parameters** (`max-params: 3` ESLint rule)
- **No explicit `any`** (warning level)
- **`prefer-const`**, **`eqeqeq`** (strict equality), **`no-else-return`**
- **Commit messages**: Conventional Commits format (`feat:`, `fix:`, `docs:`, etc.) enforced by commitlint
- Files in `src/api/generated/` are auto-generated — don't edit manually

## Testing

### Ant Design Animations in Tests

**Problem**: Ant Design components (Popover, Dropdown, Select, etc.) use CSS animations via `rc-motion` for enter/leave transitions. In JSDOM test environments, CSS animations don't fire `animationend`/`transitionend` events, so components remain in the DOM indefinitely with animation classes (`ant-zoom-big-leave`, `ant-slide-up-leave-active`, etc.).

**Solution**: When testing that components are removed from DOM after closing:

1. **Add `destroyTooltipOnHide` prop** to Popover/Dropdown components that need to be removed from DOM:
   ```tsx
   <Popover destroyTooltipOnHide ... />
   ```

2. **Use fake timers** in tests to allow animations to complete:
   ```tsx
   vi.useFakeTimers();
   // ... perform actions ...
   await vi.runAllTimersAsync(); // Advances all timers, allowing rc-motion to complete
   expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
   vi.useRealTimers();
   ```

3. **Wrap components with ConfigProvider** for cleaner test setup:
   ```tsx
   render(
     <ConfigProvider theme={{ token: { motion: false } }}>
       <YourComponent />
     </ConfigProvider>
   );
   ```

**Don't**: Check for animation classes (`ant-popover-hidden`, `ant-slide-up-leave-active`) as indicators of closure. These are implementation details and don't guarantee the element is actually removed from DOM.

**Do**: Test that elements are actually removed from DOM using `expect(screen.queryByRole('dialog')).not.toBeInTheDocument()` or similar queries.
