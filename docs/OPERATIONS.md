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
per service. These records provide status and duration, but there is currently
no metrics exporter, tracing backend, or frontend error collector.

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
