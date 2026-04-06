# 🛒 Purchases API endpoints

> [!CAUTION]
> The Purchases workflow manages deeply financial algorithms and automations. It completely drives the auto-creation of `InventoryMovement` tracing elements and dictates global `PriceHistory` transformations upon document validation. Strict precision is expected.

## 🔐 Authentication Requirements
Strict JWT injection protocol required.

### 1. Register a Procurement Draft Action
**Request Details:**
- **Endpoint:** `POST /api/v1/purchases`
- **Headers:** `Authorization: Bearer <token>`
- **Authorized Roles:** `SuperAdmin`, `Manager`, `Accountant`

**Body Requirements:**
| Key                     | Type                    | Definition                                | Status   |
|-------------------------|-------------------------|-------------------------------------------|----------|
| `documentNum`           | String                  | Invoice identifier (`BR-2026-X`)          | REQUIRED |
| `type`                  | Enum                    | `BON_RECEPTION`, `BON_COMMANDE`, etc.     | REQUIRED |
| `supplierId`            | UUID                    | Target relation                           | REQUIRED |
| `receivedAtWarehouseId` | UUID                    | Warehouse tracking destination branch     | Conditional |
| `receivedAtPosId`       | UUID                    | Active Retail store destination           | Conditional |
| `issueDate`             | ISO-8601                | Emission timestamp                        | Optional |
| `lines`                 | Array<LinePayload>      | See beneath                               | REQUIRED |

**LinePayload array structure**: `[{ productId: UUID, quantity: Decimal, unitPrice: Decimal, totalPrice: Decimal }]`

> [!WARNING]
> Either `receivedAtWarehouseId` OR `receivedAtPosId` must strictly be defined. Simultaneous injection attempts onto both parameters triggers a validation error.

### 2. Procure Validations & Inventory Injections
**Request Details:**
- **Endpoint:** `POST /api/v1/purchases/:id/validate`
- **Headers:** `Authorization: Bearer <token>`
- **Authorized Roles:** `SuperAdmin`, `Manager`

> [!IMPORTANT]
> The transaction locks document status transitioning it securely to `VALIDATED`.
> Internal hook algorithms analyze array maps executing simultaneous increments across bounded schema instances and natively capturing any price deviances autonomously tracing `PriceHistory` schemas automatically. Use extremely cautiously on live domains.

### 3. Read Architectural Aggregations
**Request Details:**
- **Endpoint:** `GET /api/v1/purchases`
- **Headers:** `Authorization: Bearer <token>`
- **Authorized Roles:** `SuperAdmin`, `Manager`, `Accountant`, `Inventory_Clerk`

*(Exposes macro financial total aggregations alongside sub-array arrays corresponding to underlying Document lines natively.)*
