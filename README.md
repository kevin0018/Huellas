# Huellas

🌐 [Spanish Version] (README.es.md)

This application is a health management platform for pet owners, designed with individual profiles for each owner and their pets to centralize all options. We plan to integrate a volunteer system to assist users, and the platform will also allow for the linking of profiles for veterinarians and insurers to keep all information updated and accessible with minimal effort.

## Technologies and Tools
- React
- TypeScript
- Tailwind CSS
- Node.js
- Express
- MySQL

## Objectives

### General
- To develop a centralized platform for users to manage their pets' information.
- To implement a system for volunteers to register and offer support services.
- To integrate profiles for veterinary clinics and insurers to allow them to offer services directly to users.

### Specific
- Build a user registration system.
- Enable users to add and manage their pets' profiles.
- Implement file upload capabilities (e.g., vaccination cards) and manage pet activities.
- Create a notification system that sends web-based alerts and email replicas.
- Ensure the application is fully responsive and adaptable to mobile devices.
- Guarantee application accessibility for an inclusive user experience.

## Architecture and Design

The project is structured around a **Hexagonal Architecture (Ports and Adapters)**, a design pattern that isolates the core business logic from external dependencies. This is achieved by separating the project into the following distinct layers:

* **Domain (`src/domain`):** This is the application's core, where business entities and rules are defined without any dependency on the infrastructure.
* **Application (`src/app`):** This layer contains the "use cases" that orchestrate interactions between the domain and the outside world, using the domain's "Ports" (Interfaces).
* **Infrastructure (`src/infra`):** This layer holds the "adapters" that implement the domain's interfaces. Its responsibility is to connect the application with external tools such as the database (MySQL) and web services.

### Frontend

The frontend is developed using **React** and **TypeScript**. The structure is based on reusable components and is organized into modules for each main functionality (`owners`, `pets`, `volunteers`), which facilitates scalability and code maintenance. We use **Tailwind CSS** for styling.

### Backend

The backend is built with **Node.js** and **Express**, strictly following the hexagonal architecture to ensure a clean, decoupled design. The infrastructure layer utilizes **MySQL** as the database, with adapters that manage all connection and query logic.

### Development Environment

We have configured the development environment using **Docker** and **Docker Compose** to simplify the project setup. These files allow any new collaborator to launch the application, database, and other dependencies with a single command.

### Collaborators
- Kevin Hernandez
- Aroa Granja
- Adriana Elias
- Fernanda Montalvan