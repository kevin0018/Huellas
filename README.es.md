# Huellas

🌐 [English Version](README.md)

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

Hemos configurado un entorno de desarrollo con **Docker** y **Docker Compose** para facilitar la configuración del proyecto. Con estos archivos, cualquier colaborador puede levantar la aplicación, la base de datos y otras dependencias con un solo comando.

### Colaboradores
- @kevin0018
- @MissAruru
- @adriElias
- @FerMon98
