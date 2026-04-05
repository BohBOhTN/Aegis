# Users Resource Endpoints

## 1. Global Genesis Initialization (SuperAdmin Seed)
**Endpoint:** `/api/v1/users/setup`
**Method:** `POST`
**Access:** `Public` (Self-Destructing)

### Description
Creates the paramount `SuperAdmin` operational identity and injects it organically into an entirely empty database architecture.
*CRITICAL:* This endpoint permanently self-locks upon successful execution. If the user count > 0, it violently rejects all interactions globally.

### Request Body
**Content-Type:** `application/json`
```json
{
  "email": "admin@aegris.com",
  "password": "secure_genesis_password!"
}
```

### Successful Response
**Status:** `201 Created`
```json
{
  "success": true,
  "message": "Genesis SuperAdmin structurally initialized flawlessly.",
  "data": {
    "id": "uuid-string-here",
    "email": "admin@aegris.com",
    "isActive": true,
    "role": {
      "name": "SuperAdmin"
    }
  }
}
```

### Error Responses
**Status:** `403 Forbidden`
```json
{
  "success": false,
  "message": "Security Intrusion: Genesis setup is permanently locked system-wide. Users currently exist."
}
```

---

## 2. Retrieve All Active Matrix Terminals
**Endpoint:** `/api/v1/users/`
**Method:** `GET`
**Access:** `Protected` (Requires JWT Bearer Header)
**Role Clearance:** `SuperAdmin`, `Admin`

### Description
Fetches a robust multi-relational aggregation defining all structurally linked active enterprise client identities securely inside the target domain.

### Headers Required
```http
Authorization: Bearer <eyJh...JWT...SEQUENCE>
```

### Successful Response
**Status:** `200 OK`
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "uuid-string-here",
      "email": "admin@aegris.com",
      "isActive": true,
      "createdAt": "2026-04-05T00:00:00.000Z",
      "role": {
        "name": "SuperAdmin",
        "permissions": {
          "all": true
        }
      }
    }
  ]
}
```

### Error Responses
**Status:** `401 Unauthorized`
```json
{
  "success": false,
  "message": "Not authorized: Authentication Token Missing"
}
```

**Status:** `403 Forbidden`
```json
{
  "success": false,
  "message": "Role Violation: You do not possess clearance for this action"
}
```
