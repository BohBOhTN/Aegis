# Aegis ERP - Core Backend API Engine

## 1. Application Responsibility
This module executes the primary business logic, database transactions, network security, and synchronization resolution for the over-arching ERP system. It adheres to strict JSON structural boundaries and provides RESTful APIs for all upstream interface consumption.

## 2. Technical Stack
- Runtime: Node.js
- Language: TypeScript (Strict Mode Enforced)
- Data Abstraction: Prisma ORM
- Core Relational Database: PostgreSQL (Remote Access)
- Defensive Middleware Layer: Helmet, Express-Rate-Limit, HPP

## 3. Initial Setup Protocol
1. Initialize dependencies via standard procedure: `npm install`.
2. Construct the local environment configuration `.env` mapping `DATABASE_URL` to the remote PostgreSQL instance.
3. Migrate database schemas: `npx prisma migrate dev`.
4. Boot the server in development mode to monitor inbound traffic.

## 4. Code Standards
Committing to the backend must ensure no business logic is housed within routing controllers. All core calculation operations must reside cleanly within the designated Services layer.
