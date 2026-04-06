# 📦 Suppliers Directory API Endpoints

The Suppliers endpoints dictate entirely structured tracking architecture covering the profiles handling the initial inbound acquisition pipelines natively utilized inside Procurement document workflows (`Bon de Reception`).

## 🔐 Authentication Requirements
Strict JWT injection protocol required.

### 1. Register a Supplier Profile
**Request Details:**
- **Endpoint:** `POST /api/v1/suppliers`
- **Headers:** `Authorization: Bearer <token>`
- **Authorized Roles:** `SuperAdmin`, `Manager`, `Accountant`, `Inventory_Clerk`

**Body Requirements:**
| Key                     | Type                    | Definition                                | Status   |
|-------------------------|-------------------------|-------------------------------------------|----------|
| `companyName`           | String                  | Primary Business Identifier               | REQUIRED |
| `contactName`           | String                  | Direct contact node                       | Optional |
| `phone`                 | String                  | Phone array link                          | Optional |
| `email`                 | String                  | Bound identically as naturally unique     | Optional |
| `address`               | String                  | Address locator                           | Optional |

*(A unique exception trace emits 409 Conflict if email overlap bounds natively detect an existing signature).*

### 2. Procure Complete Target Arrays
**Request Details:**
- **Endpoint:** `GET /api/v1/suppliers`
- **Headers:** `Authorization: Bearer <token>`
- **Authorized Roles:** `SuperAdmin`, `Manager`, `Accountant`, `Inventory_Clerk`

**Query Parameters:**
| Parameter | Type   | Description |
|-----------|--------|-------------|
| `search`  | String | Resolves structural search operations on company name explicitly. |

### 3. Read Supplier Identity Map
**Request Details:**
- **Endpoint:** `GET /api/v1/suppliers/:id`
- **Headers:** `Authorization: Bearer <token>`

*(Returns the precise matrix bound attributes alongside a relational sub-array linking the preceding 5 Purchase Documents issued intrinsically allowing frontend dashboarding of recent interactions).*

### 4. Delete Profile Softly
**Request Details:**
- **Endpoint:** `DELETE /api/v1/suppliers/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Authorized Roles:** `SuperAdmin`, `Manager`, `Accountant`

*(Triggers a non-destructive timestamp masking. Historical Purchase Documents tied structurally to the Supplier ID strictly endure unaffected mapping).*
