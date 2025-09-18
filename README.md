# Huellas

🌐 [Spanish Version](README.es.md)

**Huellas** is a health management platform for pet owners, designed with individual profiles for each owner and their pets to centralize all information.  
Future plans include integrating a volunteer system to assist users and linking profiles for veterinarians and insurers, keeping everything updated and accessible with minimal effort.

---

## 📹 Demo

[https://github.com/kevin0018/Huellas/DemoHuellas.mp4](https://github.com/kevin0018/Huellas/blob/main/DemoHuellas.mp4)

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

The project follows a **Hexagonal Architecture (Ports and Adapters)**, a design pattern that isolates the core business logic from external dependencies.  
It’s divided into three layers:

* **Domain (`src/domain`):** Core entities and business rules, independent of infrastructure.  
* **Application (`src/app`):** Use cases orchestrating interactions between the domain and outside world via ports (interfaces).  
* **Infrastructure (`src/infra`):** Adapters implementing domain ports, connecting the app to MySQL and external services.

---

## 💻 Frontend

Built with **React** and **TypeScript**, the frontend uses reusable components organized into modules (`owners`, `pets`, `volunteers`) to ensure scalability and maintainability.  
Styling is handled with **Tailwind CSS**.

---

## ⚙️ Backend

Developed with **Node.js** and **Express**, strictly following hexagonal architecture for a clean, decoupled design.  
**MySQL** is used as the database, with adapters managing connection and query logic.

---

## 🐳 Development Environment

Configured with **Docker** and **Docker Compose** to simplify setup.  
A new collaborator can run the application, database, and dependencies with a single command.

---

## 👥 Collaborators

Although we all contributed to both backend and frontend, our main focuses were:  
- [@kevin0018](https://github.com/kevin0018) → Architecture, testing & backend  
- [@adriElias](https://github.com/adriElias) → Backend  
- [@MissAruru](https://github.com/MissAruru) → Website design, logo & branding  
- [@FerMon98](https://github.com/FerMon98) → Frontend  

---
