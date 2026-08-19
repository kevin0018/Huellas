# Huellas frontend

React, TypeScript, Vite and Tailwind CSS client for Huellas.

## Run the complete stack with Docker

From the repository root:

```bash
docker compose -f backend/docker-compose.yml up --build
```

Open <http://localhost:5173>. Source files are mounted in the container and Vite
hot reload is enabled. Requests to `/api` and `/socket.io` are proxied to the API
container.

## Run only the frontend locally

Enable Corepack once so it can select the pnpm version declared by the project:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

The local Vite proxy targets `http://localhost:3000` by default. Set
`API_PROXY_TARGET` before starting Vite to use a different API origin.

## Commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm test:run
```
