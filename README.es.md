# Huellas

🌐 [English Version](README.md)

[![CI](https://github.com/kevin0018/Huellas/actions/workflows/ci.yml/badge.svg)](https://github.com/kevin0018/Huellas/actions/workflows/ci.yml)

Esta es una aplicación de gestión de salud para dueños y sus mascotas, con perfiles individuales para cada uno desde donde se podrán gestionar todas las opciones. El sistema también incluirá la integración de voluntarios para ayudar a los usuarios, así como la posibilidad de vincular perfiles de veterinarios y aseguradoras para mantener toda la información actualizada y accesible con el mínimo esfuerzo.

## Tecnologías y herramientas
- React
- TypeScript
- Tailwind
- Node.js
- Express
- MySQL

## Objetivos

### Generales
- Crear una aplicación para que los usuarios puedan gestionar la información de sus mascotas de manera centralizada.
- Implementar un sistema para que los voluntarios se registren y ofrezcan servicios de apoyo a los usuarios.
- Integrar perfiles para clínicas veterinarias y aseguradoras, permitiéndoles ofrecer sus servicios a los usuarios.

### Específicos
- Desarrollar un sistema de registro de usuarios.
- Permitir a los usuarios añadir y gestionar los perfiles de sus mascotas.
- Habilitar la subida de archivos (como cartillas de vacunación) y la gestión de las actividades de las mascotas.
- Crear un sistema de notificaciones que se active en la web y replique el envío por correo electrónico.
- Asegurar que la aplicación sea completamente adaptable a dispositivos móviles (responsive design).
- Garantizar la accesibilidad de la aplicación para ofrecer una experiencia de usuario inclusiva.

## Arquitectura y Diseño

Huellas es un **monolito modular** que se está ordenando de forma incremental,
no una implementación hexagonal estricta de manual. Las capacidades del backend
viven en `backend/src/contexts/` (identidad, mascotas, salud, citas, comunidad y
chat). Cada contexto utiliza dominio, aplicación e infraestructura cuando hay
reglas de negocio o adaptadores sustituibles; el código sencillo se mantiene
sencillo.

`backend/src/composition/createApplicationModules.ts` es la raíz de composición:
crea repositorios, servicios de aplicación, controladores HTTP y el manejador
WebSocket de chat. Los controladores se limitan a traducir HTTP y reciben sus
dependencias desde el límite del módulo. Prisma queda como detalle de
infraestructura. La superficie HTTP principal se publica como OpenAPI en
`/api/openapi.json` y está protegida por tests de contrato.

### Frontend

La parte del frontend está desarrollada con **React** y **TypeScript** y se migra
de forma incremental alrededor de `app/`, `features/`, `modules/` y `shared/`.
Las vistas consumen servicios de aplicación compuestos centralmente y hooks por
funcionalidad, en lugar de construir repositorios HTTP. El router valida la
sesión remota antes de mostrar contenido privado, y tanto la navegación como las
rutas usan las capacidades devueltas por la API. Para el estilado usamos
**Tailwind CSS**.

### Backend

El backend está construido con **Node.js**, **Express**, **Prisma** y **MySQL**.
La API es un monolito modular con factories explícitas, roles y capacidades
acumulables, soporte de sesión con Redis y chat mediante Socket.IO. Se usan
puertos de dominio cuando aportan sustitución real o valor en tests; el proyecto
no afirma que todos los archivos pertenezcan a una capa arquitectónica formal.

### Entorno de Desarrollo

El entorno completo de desarrollo funciona con **Docker Compose**. Desde la raíz
del repositorio, ejecuta:

```bash
docker compose -f backend/docker-compose.yml up --build
```

El comando inicia:

- frontend con Vite y recarga en caliente: <http://localhost:5173>;
- API: <http://localhost:3000>;
- MySQL en `localhost:3307`;
- Redis en `localhost:6379`;
- Adminer: <http://localhost:8080>.

El frontend redirige `/api` y `/socket.io` a la API dentro de Docker, por lo que
no es necesario instalar Node.js en el host. La API aplica las migraciones
versionadas de Prisma antes de arrancar. `FRONTEND_PORT` y `PORT` permiten
cambiar los puertos públicos del frontend y la API. `CORS_ORIGINS` acepta una
lista de orígenes permitidos separada por comas y por defecto solo incluye el
frontend local. Las credenciales incluidas
en Compose son exclusivamente para desarrollo local. Las dependencias de
frontend y backend se instalan desde sus lockfiles versionados con pnpm 10.10.0.
Para ejecutar fuera de Docker, usa Node 22 (`nvm use` lee la versión desde
`.nvmrc`), ejecuta `corepack enable` una vez y después
`pnpm install --frozen-lockfile` dentro de `frontend/` y `backend/`.

La integración continua ejecuta lint, typecheck, tests y build de ambas
aplicaciones. También aplica todo el historial de migraciones de Prisma sobre
una base MySQL vacía y verifica que el seed de desarrollo pueda ejecutarse dos
veces.

Para detener y eliminar los contenedores:

```bash
docker compose -f backend/docker-compose.yml down
```

### Colaboradores
- [@kevin0018](https://github.com/kevin0018)
- [@MissAruru](https://github.com/MissAruru)
- [@adriElias](https://github.com/adriElias)
- [@FerMon98](https://github.com/FerMon98)
