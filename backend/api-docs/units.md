# ⚖️ Units API endpoints

> [!NOTE]
> Allows dynamic physical dimension tracking isolated completely from default hardcoding schemas. Useful in complex inventory tracking where products alternate mass specifications.

## 🔐 Authentication Requirements
All paths mandate JWT verification. Allowed Global Roles executing implementations encompass: `SuperAdmin`, `Manager`, extending globally to view operations via token injection.

### 1. Aggregate All Available Unit Matrices
**Request Details:**
- **Endpoint:** `GET /api/v1/units`
- **Headers:** `Authorization: Bearer <token>`

**Successful JSON Payload `(200 OK)`:**
```json
{
    "success": true,
    "count": 2,
    "data": {
        "units": [
            { "id": "uuid-1", "name": "Kilogram", "symbol": "kg" },
            { "id": "uuid-2", "name": "Box", "symbol": "bx" }
        ]
    }
}
```

### 2. Configure a Custom Measuring Unit
**Request Details:**
- **Endpoint:** `POST /api/v1/units`
- **Headers:** `Authorization: Bearer <token>`
- **Authorized Roles:** `SuperAdmin`, `Manager`

**Body Requirements:**
| Key      | Type   | Definition            | Status   |
|----------|--------|-----------------------|----------|
| `name`   | String | e.g. "Centimeter"     | REQUIRED |
| `symbol` | String | e.g. "cm"             | REQUIRED |

### 3. Archive an Obsolete Unit
**Request Details:**
- **Endpoint:** `DELETE /api/v1/units/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Authorized Roles:** `SuperAdmin`
- **Validation Constraints:** Fails securely (400) if active Products populate catalog using identifier.
