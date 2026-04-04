# Aegis ERP - Core Backend API Engine

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

## 1. Application Responsibility
This module executes the primary business logic, database transactions, network security, and synchronization resolution for the overarching ERP system. It adheres to strict JSON structural boundaries and provides RESTful APIs for all upstream interface consumption.

## 2. Technical Stack
- **Runtime:** Node.js (LTS Environment)
- **Language:** TypeScript (Strict Compilation Enforced)
- **Data Abstraction:** Prisma ORM
- **Core Relational Database:** PostgreSQL (Remote Access)
- **Defensive Middleware Layer:** Helmet, Express-Rate-Limit, HPP

## 3. Initial Setup Protocol
1. Initialize dependencies via standard procedure: `npm install`.
2. Construct the local environment configuration `.env` mapping `DATABASE_URL` to the remote PostgreSQL instance.
3. Migrate database schemas: `npx prisma migrate dev`.
4. Boot the server in development mode to monitor inbound traffic: `npm run dev`.

## 4. Code Standards
Committing to the backend must strictly align with the global repository directives established in `docs/00_Development_Rules.md`. Ensure no business logic is housed within routing controllers; all core algorithmic and calculation operations must reside cleanly within the designated Services layer.
