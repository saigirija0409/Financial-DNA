# 📡 Financial DNA — API Contract & Integration Guide for Frontend (Person 2)

Hi! Here is the complete API documentation for integrating the **Financial DNA Backend** into your React / Web UI.

---

## 🌐 Server Base URL & Setup

* **Local Development Base URL**: `http://localhost:8000`
* **Interactive API Docs (Swagger UI)**: `http://localhost:8000/docs`
* **CORS Status**: ✅ Enabled for all origins (`*`), so you won't get any CORS errors from React (`localhost:3000`, `localhost:5173`, etc.).

---

## 🛠️ API Endpoints Quick Reference

| Action / Feature | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **Get Companies List** | `/api/companies` | `GET` | Populate company dropdown & show default scores |
| **Get Single Company Detail** | `/api/companies/{company_id}` | `GET` | Get detailed 7-dimension DNA score + peer Z-score anomalies |
| **Custom Score Calculator** | `/api/calculate-score` | `POST` | Calculate Financial DNA directly from custom user metrics |
| **Live Stress Simulator** | `/api/simulate` | `POST` | Recalculate DNA score live when user moves sliders |
| **Minimum Fix Counterfactual**| `/api/counterfactual` | `POST` | Get prescriptive recommendations to reach target score (e.g. 70) |
| **Multi-Quarter Mutation** | `/api/mutate` | `POST` | Calculate score evolution across sequential shock quarters |
| **LLM Context Generator** | `/api/ai-prompt-data/{id}` | `GET` | Structured prompt string to pass to Claude/Gemini API |

---

## 📖 Endpoint Specifications & Code Snippets

### 1. Get List of Benchmark Companies
**Endpoint**: `GET /api/companies`

**JavaScript Fetch Example**:
```javascript
const response = await fetch("http://localhost:8000/api/companies");
const data = await response.json();
console.log(data.companies); // Array of 8 companies with default DNA scores & metrics
```

**Sample Response JSON**:
```json
{
  "companies": [
    {
      "id": "tcs",
      "name": "Tata Consultancy Services",
      "ticker": "TCS",
      "sector": "Information Technology",
      "composite_score": 88.5,
      "health_verdict": "Fortress Health (Resilient & Elite)",
      "sub_scores": {
        "revenue_growth": 67.6,
        "profitability": 100.0,
        "cash_conversion": 100.0,
        "debt_health": 100.0,
        "liquidity": 100.0,
        "working_capital": 100.0,
        "stability": 100.0
      }
    }
  ]
}
```

---

### 2. Get Single Company Detail & Peer Anomalies
**Endpoint**: `GET /api/companies/{company_id}` (e.g. `/api/companies/tcs`)

**JavaScript Fetch Example**:
```javascript
const response = await fetch("http://localhost:8000/api/companies/tcs");
const companyData = await response.json();
console.log(companyData.peer_anomalies); // Z-score statistical outlier flags
```

---

### 3. Live Financial Stress Simulator
**Endpoint**: `POST /api/simulate`

**Request Headers**: `Content-Type: application/json`

**Sample Request Payload**:
```json
{
  "company_id": "tcs",
  "revenue_change_pct": -20.0,
  "cost_increase_pct": 10.0,
  "debt_increase_pct": 15.0,
  "cash_flow_drop_pct": 10.0
}
```

**JavaScript React / Axios Example**:
```javascript
import axios from 'axios';

const runSimulation = async (companyId, sliders) => {
  const res = await axios.post("http://localhost:8000/api/simulate", {
    company_id: companyId,
    revenue_change_pct: sliders.revenueChange, // e.g. -20
    cost_increase_pct: sliders.costIncrease,   // e.g. 10
    debt_increase_pct: sliders.debtIncrease,   // e.g. 15
    cash_flow_drop_pct: sliders.cashFlowDrop   // e.g. 10
  });

  console.log("Simulated Composite Score:", res.data.simulated_dna.composite_score);
  console.log("Score Delta:", res.data.score_delta);
  console.log("Needle Mover:", res.data.needle_mover.summary);
  console.log("Quarters to Recover:", res.data.recovery_timeline.estimated_quarters_to_recover);
  
  return res.data;
};
```

---

### 4. Prescriptive "Minimum Fix" Counterfactual Engine
**Endpoint**: `POST /api/counterfactual`

**Sample Request Payload**:
```json
{
  "company_id": "bbby",
  "target_score": 70.0
}
```

**Sample Response JSON**:
```json
{
  "status": "success",
  "current_score": 32.4,
  "target_score": 70.0,
  "score_gap": 37.6,
  "minimum_fixes": [
    {
      "action": "Reduce Total Debt / Leverage",
      "lever": "debt_to_equity",
      "requirement": "Cut debt-to-equity ratio by 65% (from 4.8 to 1.68)",
      "resulting_score": 71.2
    },
    {
      "action": "Expand Operational Net Profit Margin",
      "lever": "net_profit_margin",
      "requirement": "Increase net profit margin by +15% (from -12.4% to 2.6%)",
      "resulting_score": 70.5
    }
  ]
}
```

---

### 5. Calculate Score for Custom User Metrics
**Endpoint**: `POST /api/calculate-score`

**Sample Request Payload**:
```json
{
  "revenue_growth": 12.0,
  "net_profit_margin": 15.0,
  "cash_conversion": 1.1,
  "debt_to_equity": 0.4,
  "current_ratio": 1.8,
  "working_capital_ratio": 0.2,
  "revenue_std_dev_ratio": 0.05
}
```

**Sample Response JSON**:
```json
{
  "status": "success",
  "composite_score": 86.4,
  "health_verdict": "Fortress Health (Resilient & Elite)",
  "sub_scores": {
    "revenue_growth": 91.0,
    "profitability": 100.0,
    "cash_conversion": 100.0,
    "debt_health": 100.0,
    "liquidity": 90.0,
    "working_capital": 100.0,
    "stability": 100.0
  }
}
```

---

## ❓ FAQ / Troubleshooting for Frontend

1. **How do I connect React to the Backend?**
   Make sure the Python server is running (`uvicorn main:app --reload --port 8000`) and call `http://localhost:8000/api/...` directly from React.
2. **Do I need any API Key for the Python Backend?**
   No! The Python backend handles scoring and simulation locally without any API key requirement.
3. **What if an endpoint fails?**
   Check the terminal where `uvicorn` is running, or visit `http://localhost:8000/docs` to test endpoints interactively in your browser.
