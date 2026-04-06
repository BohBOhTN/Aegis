# Sales Documents Tracking Engine API

This module furnishes the atomic structure enabling the manual digital ledger. It natively binds documents (DEVIS, BC, BL, FACTURE, AVOIR) to authenticated Dispatch Points and systematically calculates native inventory modifications upon manual validations.

**Base URL:** `/api/v1/documents`

---

## 1. Instantiate a Sales Draft Document
**Endpoint:** `POST /api/v1/documents`
**Access Level:** `SuperAdmin`, `Manager`, `Accountant`, `POS_User`

Generates an unvalidated native Draft. No physical stock or financial client debts are manipulated during this phase.

### Target Payload Structure
```json
{
  "documentNum": "FACT-2026-0001",
  "type": "FACTURE", 
  "clientId": "client-uuid",
  "dispatchFromWarehouseId": "warehouse-uuid",
  "issueDate": "2026-04-06T12:00:00Z",
  "lines": [
    {
      "productId": "product-uuid",
      "quantity": 10,
      "unitPrice": 1500.00,
      "totalPrice": 15000.00
    }
  ]
}
```
*Note:* `dispatchFromWarehouseId` and `dispatchFromPosId` are natively mutually exclusive. `type` must strictly map to Prisma enumerations.

### Success Response `(201 Created)`
```json
{
  "success": true,
  "data": {
    "id": "doc-uuid",
    "status": "DRAFT",
    "totalTTC": "17851.000",
    "createdAt": "2026-04-06T..."
  }
}
```

---

## 2. Global Document Registry Reader
**Endpoint:** `GET /api/v1/documents`
**Access Level:** `SuperAdmin`, `Manager`, `Accountant`, `POS_User`

Returns a chronologically descending array mapping all documents alongside lightweight client metadata.

---

## 3. Extract Specific Sales Monolith
**Endpoint:** `GET /api/v1/documents/:id`
**Access Level:** `SuperAdmin`, `Manager`, `Accountant`, `POS_User`

Returns a deeply nested payload encompassing detailed native product lines and natively processed payments executed against the target ledger.

---

## 4. Validate Sales Trace and Actuate Physics
**Endpoint:** `POST /api/v1/documents/:id/validate`
**Access Level:** `SuperAdmin`, `Manager`, `Accountant`

**CRITICAL ENDPOINT.** Shifts the target Draft unconditionally into Validated format natively executing two algorithmic dependencies:
1. **Physical Logistics Trace:** If document evaluates as physical dispatch mapping natively (`BL`, `FACTURE`), the exact mapped dispatch origin strictly subtracts matching stock capacities natively. AVOIR logic natively mathematically reverses this behavior.
2. **Financial Debit Tracing:** If the document asserts transactional mass, the natively linked Client profile `balance` immediately encounters a strict mathematical increment by `totalTTC`.

### Target Validation Payload
```json
{
  "dispatchFromWarehouseId": "warehouse-uuid" 
}
```
*Note:* Must map the identical physical boundary declared originally via Draft.

### Validation Success `(200 OK)`
```json
{
  "success": true,
  "data": {
    "id": "doc-uuid",
    "status": "VALIDATED"
  }
}
```
