# Browser and HTTP integration tests

These tests use the production frontend build, the real API, MySQL and Redis.
They create their own accounts through HTTP and remove those accounts afterwards.
The development seed is never run.

Use Node 22 and pnpm 10.10.0. From the repository root:

```sh
pnpm --dir backend install --frozen-lockfile
pnpm --dir backend prisma:generate
pnpm --dir frontend install --frozen-lockfile
pnpm --dir frontend exec playwright install --with-deps chromium
docker compose -f compose.e2e.yml up -d --wait
pnpm --dir frontend test:e2e
docker compose -f compose.e2e.yml down
```

The test Compose project is `huellas-e2e`. MySQL uses localhost port 33306 and
an ephemeral filesystem; Redis uses localhost port 36379. The API and preview
use ports 3001 and 4173. Existing application servers are never reused.

The bootstrap requires the MySQL database `huellas_e2e`, deploys migrations and
upserts one preventive-care fixture. Redis database **15** is reserved for this
suite and cleared at startup so real rate limits do not accumulate across runs.
Never point these settings at a database with data you want to keep.

CI supplies `E2E_DATABASE_URL` and `E2E_REDIS_URL` for its dedicated services.
Local defaults are `mysql://root:e2e@127.0.0.1:33306/huellas_e2e` and
`redis://127.0.0.1:36379/15`. `VITE_API_URL` is explicitly set to `/api` by the
runner, so a developer's frontend `.env` cannot redirect requests to their API.

## Suites

- `pnpm --dir frontend test:run`: fast component, application and routing tests.
- `pnpm --dir backend test`: fast domain, application and mocked HTTP tests.
- `pnpm --dir frontend test:e2e:public`: browser checks for Home and About,
  without API/database services. Exercises Spanish, English and Catalan at
  320, 375, 414, 768 and 1440 px in light and dark themes; saves full-page captures.
- `pnpm --dir frontend test:e2e`: public checks plus the pet → health event →
  next care journey in mobile and desktop browsers, and real HTTP ownership
  tests for pets, events, documents, appointments, reminders and revocable shares.
- `pnpm --dir frontend test:full`: frontend fast tests followed by the E2E suite;
  requires the test services above. Backend fast tests remain a separate command.

Reports, captures and failure traces are in `frontend/playwright-report/` and
`frontend/test-results/`, both ignored by Git. CI uploads them for seven days.
Tests use generated accounts and fixture health data, never personal records.
