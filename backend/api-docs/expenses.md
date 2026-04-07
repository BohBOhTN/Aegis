# Treasury Operational Expenses API

The Treasury modules map structural outflows natively logging leakage parameters such as electrical utility bounds, payroll executions, and supplier equipment acquisitions bypassing standard PO validation tracking.

**Base URL:** `/api/v1/expenses`

## 1. Extract Treasury Executions

Collects a tracked historical vault of all natively created expenses chronologically.

* **URL Path:** `/`
* **Method:** `GET`
* **RBAC Restrictions:** Permitted effectively to `SuperAdmin`, `Manager`, and `Accountant` personnel.

### Payload Execution (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-expense-xyz",
      "category": "UTILITIES",
      "amount": 200.50,
      "date": "2026-04-07",
      "description": "Monthly STEG Electricity Mapping",
      "recordedById": "uuid-accountant",
      "receiptAttachmentPath": "/uploads/treasury/steg_apr.pdf"
    }
  ]
}
```

## 2. Declare Operational Leakage

Validates a new structural operating expense natively, immediately offsetting global analytics Net Balance vaults.

* **URL Path:** `/`
* **Method:** `POST`
* **RBAC Restrictions:** Permitted effectively to `SuperAdmin`, `Manager`, and `Accountant` personnel.

### Request Body Configuration
```json
{
  "category": "MAINTENANCE",
  "amount": 850.00,
  "description": "Forklift Hydraulic Repair",
  "date": "2026-04-07",
  "posId": "pos-main",
  "warehouseId": "warehouse-external"
}
```

### Constraints natively enforced
- Accepts isolated `posId` or `warehouseId` tags tracking local origin consumption offsets securely.
- Only exact Category bounds natively registered inside the `ExpenseCategory` Enum map correctly bypass testing matrix rejections.
