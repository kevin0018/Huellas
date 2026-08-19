# Huellas

🌐 [Spanish Version](README.es.md)

[![CI](https://github.com/kevin0018/Huellas/actions/workflows/ci.yml/badge.svg)](https://github.com/kevin0018/Huellas/actions/workflows/ci.yml)

**Huellas** is a health management platform for pet owners, designed with individual profiles for each owner and their pets to centralize all information.  
Future plans include integrating a volunteer system to assist users and linking profiles for veterinarians and insurers, keeping everything updated and accessible with minimal effort.

---

## 📹 Demo

[Video Demo](https://github.com/kevin0018/Huellas/blob/main/DemoHuellas.mp4)

*(click to view video)*

---

## 🛠️ Technologies and Tools
- React
- TypeScript
- Tailwind CSS
- Node.js
- Express
- MySQL
- Prisma
- Docker & Docker Compose
- Figma

---

## 🎯 Objectives

### General
- Develop a centralized platform for users to manage their pets' information.
- Implement a system for volunteers to register and offer support services.
- Integrate profiles for veterinary clinics and insurers so they can offer services directly to users.

### Specific
- Build a user registration system.
- Enable users to add and manage their pets' profiles.
- Implement file upload capabilities (e.g., vaccination cards) and manage pet activities.
- Create a notification system that sends web-based alerts and email replicas.
- Ensure the application is fully responsive and adaptable to mobile devices.
- Guarantee application accessibility for an inclusive user experience.

---

## 🏗️ Architecture and Design

Huellas is an incremental **modular monolith**, rather than a strict textbook
hexagonal implementation. Backend capabilities live under
`backend/src/contexts/` (identity, pets, health, appointments, community and
chat). A context may use domain, application and infrastructure layers when it
has business rules or replaceable adapters; simpler code is kept simple.

`backend/src/composition/createApplicationModules.ts` is the composition root:
it creates repositories, application services, HTTP controllers and the chat
WebSocket handler. Controllers translate HTTP only and receive their
dependencies from the module boundary. Prisma remains an infrastructure detail.
The core HTTP surface is published as OpenAPI at `/api/openapi.json` and is
protected by contract tests.

---

## 💻 Frontend

Built with **React** and **TypeScript**, the frontend is migrated incrementally
around `app/`, `features/`, `modules/` and `shared/`. Views consume centrally
composed application services and feature hooks instead of constructing HTTP
repositories. Routing validates the remote session before rendering private
content, and both navigation and routes use the capabilities returned by the
API. Styling is handled with **Tailwind CSS**.

---

## ⚙️ Backend

Developed with **Node.js**, **Express**, **Prisma** and **MySQL**. The API is a
modular monolith with explicit module factories, accumulated roles/capabilities,
Redis-backed session support and Socket.IO chat. Domain ports are used where
they provide real substitution or test value; the project does not claim that
every file belongs to a formal architecture layer.

---

## 🐳 Development Environment

The complete development stack runs with **Docker Compose**. From the repository
root, run:

```bash
docker compose -f backend/docker-compose.yml up --build
```

The command starts:

- frontend with Vite and hot reload: <http://localhost:5173>;
- API: <http://localhost:3000>;
- MySQL on `localhost:3307`;
- Redis on `localhost:6379`;
- Adminer: <http://localhost:8080>.

The frontend proxies `/api` and `/socket.io` to the API inside Docker, so no
host Node.js installation is required. The API applies the versioned Prisma
migrations before starting. `FRONTEND_PORT` and `PORT` can override the public
frontend and API ports. `CORS_ORIGINS` accepts a comma-separated allowlist and
defaults to the two local frontend origins. The credentials included in Compose are for local
development only. Frontend and backend dependencies are installed from their
versioned pnpm lockfiles with pnpm 10.10.0. For local execution outside Docker,
use Node 22 (`nvm use` reads the version from `.nvmrc`), run `corepack enable`
once and then `pnpm install --frozen-lockfile` inside `frontend/` and `backend/`.

CI runs lint, typecheck, tests and builds for both applications. It also applies
the complete Prisma migration history to an empty MySQL database and verifies
that the development seed can be run twice.

Stop and remove the containers with:

```bash
docker compose -f backend/docker-compose.yml down
```

---

## 👥 Collaborators

Although we all contributed to both backend and frontend, our main focuses were:  
- [@kevin0018](https://github.com/kevin0018) → Architecture, testing & backend  
- [@adriElias](https://github.com/adriElias) → Backend  
- [@MissAruru](https://github.com/MissAruru) → Website design, logo & branding  
- [@FerMon98](https://github.com/FerMon98) → Frontend  

---
