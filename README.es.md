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

El proyecto está diseñado siguiendo una **arquitectura hexagonal (Ports and Adapters)**, un patrón que nos permite aislar la lógica de negocio principal de las dependencias externas. Esto se logra separando el proyecto en las siguientes capas:

* **Dominio (`src/domain`):** El núcleo de la aplicación, donde se definen las entidades y las reglas de negocio, sin ninguna dependencia de la infraestructura.
* **Aplicación (`src/app`):** Esta capa contiene los "casos de uso" (use cases) que orquestan las interacciones entre el dominio y el mundo exterior, utilizando las "Interfaces" (Ports) del dominio.
* **Infraestructura (`src/infra`):** Aquí se encuentran los "adaptadores" que implementan las interfaces del dominio para conectar la aplicación con la base de datos (MySQL), los servicios web y otras herramientas.

### Frontend

La parte del frontend está desarrollada con **React** y **TypeScript**. La estructura se basa en componentes reutilizables, y se organiza en módulos para cada una de las funcionalidades principales (`owners`, `pets`, `volunteers`), lo que facilita la escalabilidad y el mantenimiento del código. Para el estilado, usamos **Tailwind CSS**.

### Backend

El backend está construido con **Node.js** y **Express**, siguiendo la arquitectura hexagonal para asegurar un diseño limpio y desacoplado. La capa de infraestructura utiliza **MySQL** como base de datos, con adaptadores que gestionan la conexión y las consultas.

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
