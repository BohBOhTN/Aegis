# 📦 Categories API endpoints

> [!IMPORTANT]
> The Category module supports recursive hierarchies linking parental branches. Implementing a resilient taxonomy is pivotal for dynamic grouping implementations.

## 🔐 Authentication Requirements
All paths mandate JWT presence natively encoded through `<Bearer ${token}>`. Global Roles authorized to administer endpoints generally include: `SuperAdmin`, `Manager`, with variable GET exposure to subsequent internal operations like `Accountant` or `Sales_Agent`.

### 1. Retrieve Configured Categories
**Request Details:**
- **Endpoint:** `GET /api/v1/categories`
- **Headers:** `Authorization: Bearer <token>`
- **Authorized Roles:** `SuperAdmin, Manager, Accountant, Sales_Agent, Inventory_Clerk`

**Successful JSON Payload `(200 OK)`:**
```json
{
    "success": true,
    "count": 1,
    "data": {
        "categories": [
            {
                "id": "uuid-v4",
                "name": "Electronics",
                "description": "Hardware modules",
                "parentId": null,
                "createdAt": "2026-04-05T12:00:00Z"
            }
        ]
    }
}
```

### 2. Scaffold a New Category Branch
**Request Details:**
- **Endpoint:** `POST /api/v1/categories`
- **Headers:** `Authorization: Bearer <token>`
- **Authorized Roles:** `SuperAdmin`, `Manager`

**Body Requirements:**
| Key         | Type   | Definition                          | Status   |
|-------------|--------|-------------------------------------|----------|
| `name`      | String | Label distinctifying the group       | REQUIRED |
| `description` | String | Contextual string                   | Optional |
| `parentId`  | UUID   | Link isolating parent structuralism | Optional |

**Successful JSON Payload `(201 Created)`:**
```json
{
    "success": true,
    "data": {
        "category": {
            "id": "uuid-v4",
            "name": "Smartphones",
            "parentId": "parent-uuid"
        }
    }
}
```

### 3. Establish a Soft-Deletion 
**Request Details:**
- **Endpoint:** `DELETE /api/v1/categories/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Authorized Roles:** `SuperAdmin`
- **Validation Constraints:** Will strictly emit `400 Bad Request` if products or internal children are actively bound natively to the target category. Referential integrity represents the structural priority.
