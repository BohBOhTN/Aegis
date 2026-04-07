# Executive Analytics Matrix API

The Executive Analytics endpoints process thousands of native interactions to compile performance snapshots securely without exposing direct physical raw records into the V8 memory engine.

**Base URL:** `/api/v1/analytics`

## 1. Extract Central Overview Data

Exhaustively aggregates physical warehouse capacities and real-time daily operational velocities dynamically.

* **URL Path:** `/overview`
* **Method:** `GET`
* **RBAC Restrictions:** Restricted exclusively to `SuperAdmin` and `Manager` clearance vectors natively.

### Execution Metrics (200 OK)
```json
{
  "success": true,
  "data": {
    "stockValuation": {
      "totalPurchaseValuation": 154000.540,
      "totalSalesValuation": 220000.800,
      "warehouseBreakdown": 4,
      "posBreakdown": 2
    },
    "dailyPerformance": {
      "sales": 55430.200,
      "posSalesBreakdown": [
        { "dispatchFromPosId": "pos-001", "_sum": { "totalTTC": 25000 } },
        { "dispatchFromPosId": "pos-002", "_sum": { "totalTTC": 30430.2 } }
      ],
      "collections": 40000.500,
      "purchases": 1200.000,
      "disbursed": 5000.000,
      "expenses": 200.000,
      "netBalanceOffset": 34800.500
    }
  }
}
```

### Algorithmic Explanations natively:
- **totalPurchaseValuation:** The absolute systemic cost paid to acquire all inventory currently housed securely.
- **totalSalesValuation:** The theoretical maximum return projection upon successfully liquidating current physical inventory bounds at active catalog tracking.
- **netBalanceOffset:** Evaluates real cash-in (Collections) offset physically against cash-out (Supplier `disbursed` + Operating `expenses`). Projections map directly to Daily Treasury.
