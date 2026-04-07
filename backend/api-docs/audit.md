# Cryptographic Audit Tracking API

The structural core natively records all significant systemic modifications mapping to absolute origins ensuring physical accountability and executive isolation.

**Base URL:** `/api/v1/audit`

## 1. Retrieve Historical System Modifications

Aggregates paginated structural overrides mapping actions against user payloads.

* **URL Path:** `/`
* **Method:** `GET`
* **RBAC Restrictions:** Absolute restriction explicitly mapped to `SuperAdmin` exclusively. Bounces instantly upon Manager access arrays.

### Query Limitations
- Supports limits natively (defaulting exactly to 100 historical entities mapped descending chronologically).

### Payload Definition (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-audit-1",
      "entity": "APP_SETTINGS",
      "action": "UPDATE",
      "userId": "uuid-superadmin",
      "details": {
        "modifiedFields": ["defaultTva"],
        "oldValue": 19.0,
        "newValue": 20.0
      },
      "createdAt": "2026-04-07T05:00:00Z"
    }
  ]
}
```

### Supported Entities Natively Logged
- `APP_SETTINGS`: All tracking parameters altering systemic arithmetic.
- `USER_CREDENTIALS`: Mapping structural shifts tracking authentication boundaries.
- `FINANCIAL_DELETE`: Mapping any administrative execution natively bypassing soft-delete ledgers.
