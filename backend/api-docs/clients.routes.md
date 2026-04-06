# Clients Directory API Specification

The Clients endpoints furnish B2B and B2C tracking paths and autonomously handle credit/balance due tracking based natively on validated sale actions.

All actions strictly govern internal RBAC authorization constraints natively intercepted.

**Base URL:** `/api/v1/clients`

---

## 1. Register a Client Profile
**Endpoint:** `POST /api/v1/clients`
**Access Level:** `SuperAdmin`, `Manager`, `Accountant`, `POS_User`

Creates a natively secured record. Uniqueness on the Email column is algorithmically enforced natively against the whole DB span.

### Expected Target Payload
```json
{
  "type": "B2B", 
  "companyName": "Corp Tech Co.",
  "matriculeFiscal": "MF38183182X",
  "address": "100 Avenue Habib Bourguiba, Tunis",
  "phone": "+216 22 22 22 22",
  "email": "contact@corptech.com"
}
```
*Note:* `type` must specifically isolate between `B2B` and `B2C`. `companyName` is universally mandatory.

### Successful Response Format `(201 Created)`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "B2B",
    "companyName": "Corp Tech Co.",
    "balance": "0.000",
    "createdAt": "2026-04-06T..."
  }
}
```

---

## 2. Global Directory Extraction
**Endpoint:** `GET /api/v1/clients`
**Access Level:** `SuperAdmin`, `Manager`, `Accountant`, `POS_User`

### Native Request Queries
| Query | Type | Target Application |
|-------|------|--------------------|
| `search` | string | Algorithmically matches `companyName` (Insensitive) |
| `type` | string | Filters string value for either `B2B` or `B2C` natively |

### Request Format Matrix
`GET /api/v1/clients?search=Tech&type=B2B`

---

## 3. Extract Specific Financial Entity Ledger
**Endpoint:** `GET /api/v1/clients/:id`
**Access Level:** `SuperAdmin`, `Manager`, `Accountant`, `POS_User`

Retrieves the entity details, appending mathematically accurate aggregations:
1. Top 5 recently validated sales documents attached.
2. Top 5 recently executed transaction logs (Payments).

---

## 4. Amend Entity Parameters
**Endpoint:** `PUT /api/v1/clients/:id`
**Access Level:** `SuperAdmin`, `Manager`, `Accountant`, `POS_User`

Modifies profile data cleanly mapping against any existing email collision logic.

---

## 5. Terminate / Archive Profile
**Endpoint:** `DELETE /api/v1/clients/:id`
**Access Level:** `SuperAdmin`, `Manager`

Applies a purely logical soft deletion natively upon the target profile conditionally requiring `balance` === 0 natively evaluating. If the client currently harbors active debt standing `(balance > 0)`, the function aborts returning HTTP Code `400`.
