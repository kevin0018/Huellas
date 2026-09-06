# API operations

## Request correlation and logs

Every HTTP response carries `X-Request-ID`. The frontend generates a random UUID v4
for each request; the API accepts only UUID v4 headers and replaces other values.
CORS permits this header and exposes it to browser code. `ApiError.requestId`
retains a valid response ID without changing the existing error message or status.
On local-network HTTP origins, generation uses `crypto.getRandomValues` rather
than requiring the secure-context-only `crypto.randomUUID` API.

The running API writes one JSON record per completed or aborted HTTP request:

```json
{"time":"2026-09-05T00:00:00.000Z","level":"info","event":"http.request","requestId":"de6712c8-d2ae-4ee0-9c7a-c248a319c72d","method":"GET","route":"/api/pets/:id","status":200,"durationMs":12.34}
```

Nested asynchronous controller logs inherit the request ID. Requests aborted
before completion use status `499` in the log only. Unmatched routes use the
literal label `unmatched`; route labels come from Express templates, never the
requested URL. Non-request lifecycle events have no request ID.

Logs omit request/response bodies, query strings, path parameter values, IPs,
headers, tokens, cookies, user IDs, health records, SQL, error messages and stacks.
Errors retain only a small allowlist of database/network codes; other failures
are `UNCLASSIFIED`. Event names must be fixed strings authored in code.
The backend linter rejects direct console calls in runtime code. The manual
seed command is the only exception and is not part of the running API.

To investigate a request, copy its response ID from the browser Network panel
and find the matching JSON records in the API logs:

```sh
docker compose -f backend/docker-compose.yml logs --tail=200 api
```

Logs go to stdout (info/warn) or stderr (error). Compose retains two 5 MB files
per service. A protected Prometheus exporter and a coarse frontend error collector are
also available, as described below. There is no external tracing backend.

## Liveness and readiness

| Endpoint | Success | Dependency failure / shutdown |
| --- | --- | --- |
| `GET /live` | 200 while the HTTP process responds | Stays 200 during dependency outages |
| `GET /health` | Legacy alias of `/live` | Same liveness semantics |
| `GET /ready` | 200 when all checks pass | 503 with boolean dependency checks |

All three responses use `Cache-Control: no-store`. Readiness checks `SELECT 1`
through both Prisma and the legacy mysql2 pool, plus Redis `PING`. It returns
only `{status, checks: {prisma, mysql, redis}}`, without connection details.
Checks run concurrently with a 1.5 second response deadline and a one second
in-process cache. Concurrent callers share work; a timed-out operation is not
started again until it settles, preventing queued probe accumulation. The
response deadline does not cancel the underlying database operation.

API handlers and new Socket.IO connections require readiness. During an outage
the HTTP gate returns 503 and `Retry-After: 1`; existing sockets are not evicted.
A cached successful check can remain valid for up to one second. Redis readiness
uses the client's `isReady` state, and commands are not queued while disconnected.
Redis reconnects in the background so liveness is available during an outage.

Compose probes `/ready` and waits for the API to become healthy before starting
the frontend. A production ingress must likewise use `/ready` to admit traffic
and `/live` for process liveness. This repository's Compose file is a development
environment, not a complete production deployment configuration.

On SIGINT/SIGTERM the API marks itself unready, closes Socket.IO and its attached
HTTP server, then releases both database clients and Redis. Cleanup has a ten
second deadline; timeout or cleanup failure produces a nonzero exit.

## Verification

```sh
pnpm --dir backend test
pnpm --dir frontend test:run
docker compose -f compose.e2e.yml up -d --wait
pnpm --dir frontend test:e2e
docker compose -f compose.e2e.yml down
```

Backend tests exercise concurrent correlation, secret omission, dependency
failure/recovery, bounded hanging checks and shutdown admission. Browser tests
verify the real frontend request ID is returned by the API; HTTP integration
tests check real MySQL/Redis readiness, CORS and authentication failures.
The E2E runner waits on `/ready`. See [the test guide](../frontend/e2e/README.md)
for isolation requirements. Never use production data for failure drills.

## Metrics and browser failures

Set `METRICS_TOKEN` to an independently generated secret of at least 32 characters
in the API environment (Compose forwards it). `GET /metrics` requires that exact
value as a Bearer token; ordinary user JWTs do not grant access. Missing/short
configuration disables the endpoint with 404. Never put this token in a Vite
variable, URL or public dashboard. Configure a Prometheus scrape using its
`authorization.credentials_file` facility and protect the transport with TLS
or a private network. No collector or external service is deployed automatically.

The exporter uses the [official Prometheus Node client](https://github.com/prometheus/client_js).

| Metric | Meaning |
| --- | --- |
| `huellas_http_requests_total{method,status}` | Completed requests; 5xx counts give API errors, 499 means aborted |
| `huellas_http_request_duration_seconds` | Histogram with fixed buckets, labelled only by method |
| `huellas_mysql_connections{state}` | MySQL server-wide connected/running threads, including other clients |
| `huellas_mysql_metrics_up` | 1 if connection statistics were sampled, 0 on failure |
| `huellas_frontend_failures_total{kind}` | Accepted, sampled, untrusted browser reports by fixed category |

Counters reset with the process. Scrapes are excluded from HTTP metrics. There
are no IDs, URLs or user-specific metric labels. MySQL statistics use `SHOW GLOBAL
STATUS`, with a five second cache, a shared query and a 1.5 second response limit.
Unavailable samples clear the connection gauges instead of publishing stale zeros.
These are server metrics, not Prisma pool utilization; configure MySQL read
permissions appropriately. Aggregate rates/percentiles in the collector across
API instances, not by summing histogram averages.

The frontend reports React boundary failures, runtime errors, unhandled promise
rejections (excluding cancellation), network failures and HTTP 5xx. It sends
only a fixed category and, for HTTP failures, a validated response request ID.
No message, stack, page URL, form data, user ID, token, cookie or referrer is sent.
Native fetch with a two second deadline prevents recursive reporting; collector
failure has no effect on the user's action. Each browser sends at most one report
per category per minute, without persistent visitor identifiers.

`POST /api/client-errors` works during dependency outages and has a 1 KB parser
limit. It rejects unexpected fields and arbitrary categories/IDs. Accepted reports
are capped at 120 per process per minute, globally, with no per-visitor map. Reports
are anonymous and spoofable: use them to locate regressions, never as an audit log
or a precise error rate. JSON logs connect the collector request ID to an optional
`relatedRequestId` from the failed API response.

## Encrypted backups and safe recovery

The commands below run from the repository root with Node 22, pnpm and Docker.
They use the selected Compose `mysql` service's `MYSQL_DATABASE` and root password
inside the container; the password is never passed as a command-line argument.
Do not run schema migrations during a backup. The dump uses a single InnoDB
transaction and includes the complete schema, data, Prisma migration history and
binary health documents. Redis sessions/rate limits are not part of this archive.

Create a 32-byte key once in a private directory outside the repository. Keep a
separate, securely stored copy: losing the key makes the backup unrecoverable.
For example, using an absolute path in an existing private directory:

```sh
pnpm --dir backend exec node -e "require('fs').writeFileSync('/secure/huellas.backup-key', require('crypto').randomBytes(32), {flag:'wx', mode:0o600})"
pnpm --dir backend db:backup --compose docker-compose.yml --file /secure/huellas-2026-09-05.huellas-backup --key-file /secure/huellas.backup-key
pnpm --dir backend db:restore --compose docker-compose.yml --file /secure/huellas-2026-09-05.huellas-backup --key-file /secure/huellas.backup-key --database huellas_restore_20260905
```

pnpm runs these scripts from `backend`, so Compose paths above are relative to
that directory. The archive is gzip-compressed and encrypted with AES-256-GCM,
with a fresh IV and authentication tag. Archives are exclusively created with
mode 600; key files must have owner-only permissions. Existing archives cannot
be overwritten. Archive names and keys are ignored by Git, but they should still
be stored outside the checkout and on a separate storage system.

Restoration authenticates the entire archive before creating a database or
executing SQL. It decrypts to an owner-only temporary directory, removes that
scratch data when finished, and accepts only **new** `huellas_restore_NAME`
databases. Wrong keys, altered archives and existing destination databases fail.
An interrupted import can leave a partial new recovery database; inspect it and
choose another new destination for a retry. Use only archives produced by this
trusted backup command. Encryption authenticates bytes, not the provenance of SQL.

After recovery, validate application reads, record counts, binary attachments,
foreign keys and migrations with the deployed application version. Keep the
application stopped while deliberately switching both `DATABASE_URL` and the
legacy `DB_NAME` to the validated database. In a disaster recovery, rotate
`JWT_SECRET` and restart all API instances to invalidate pre-recovery sessions;
Redis revocations may otherwise be newer or older than the restored data.
Changing configuration, deleting old databases and resuming production traffic
are explicit operator actions; these scripts do none of them automatically.

Backups are on demand: no production schedule, off-host retention or disaster
recovery objective is claimed. Operators must set backup frequency/retention and
store keys separately for their deployment. Interrupted processes may leave
scratch data, so use an encrypted or ephemeral temporary filesystem for recovery.

The repeatable recovery drill uses only localhost port 33306 and the disposable
`compose.e2e.yml` MySQL service:

```sh
docker compose -f compose.e2e.yml up -d --wait mysql
pnpm --dir backend db:test-recovery
docker compose -f compose.e2e.yml down
```

It adds its own synthetic fixture, verifies records, blobs, migration checksums,
foreign keys, unchanged source data, permissions, no-overwrite and tamper/wrong-key
rejection, then removes only its fixture and randomly named recovery database.
It runs in a dedicated CI job; no archive or key is uploaded as a CI artifact.
