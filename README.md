# Aegis Enterprise Resource Planning (ERP) System

## 1. Overview
The Aegis ERP is a monolithic core infrastructure designed to handle B2B/B2C client routing, multi-site warehouse inventory operations, and offline-compatible Point of Sale (POS) synchronization protocols. It is engineered strictly on an enterprise stack comprising Node.js, Prisma ORM, PostgreSQL, and React.js.

## 2. Core System Modules
- Authentication & Role-Based Access Control
- Client & Supplier Directory Management
- Multi-Warehouse Inventory Operations
- Validated Financial Document Generation (Facturation, Devis, BL)
- Data-driven Point of Sale Operations
- Immutable Global Audit Trails

## 3. Architecture Specification
The software implements Clean Architecture principles utilizing an N-Tier approach within the Node.js backend to enforce strict separation of concerns. 

Please note: For the initial version release train, development is isolated entirely to the core backend engine. The frontend application is currently vacant and will be formally initialized in upcoming versions once backend integration tests pass.

## 4. Environment Protocol Standard
- Node.js LTS (v18+)
- PostgreSQL Server Instance (Remote configuration)
- Package Registry: npm

Maintainers are expected to comply strictly with Semantic Versioning (Major.Minor.Patch) and branch-based Pull Request processes. Commits pushed directly to the main branch are prohibited in this repository.
