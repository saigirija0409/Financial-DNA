# 🏛️ Financial DNA — Jury Defense & Architectural FAQs

This guide prepares your team to answer tough questions from hackathon judges, technical leads, and the **Head of AI @ TCS & COE**.

---

## ❓ Question 1: "How are you training the model?"

### 🎯 Quick 15-Second Pitch Defense:
> **"We deliberately do NOT train a black-box Machine Learning model for core accounting scoring, and this is an enterprise architectural decision. CFOs and financial regulators reject black-box neural networks because they hallucinate balance sheet math and cannot explain scores. We built a Deterministic Rule-Based & Peer Z-Score Kernel for 100% mathematical precision, paired with a Generative LLM layer for natural-language executive insights."**

### 🔬 Deep Technical Breakdown:
1. **Explainable AI (XAI)**:
   In institutional finance (banking, credit scoring, SEC audits), models must be *auditable*. A rule-based kernel + Z-score anomaly detector provides exact mathematical breakdown for every single sub-score (0–100).
2. **Statistical Peer Benchmarking (Gaussian Z-Scores)**:
   While the core rules are deterministic, the engine performs **dynamic statistical benchmarking**. It calculates the mean ($\mu$) and standard deviation ($\sigma$) of each metric across industry peers to detect statistical outliers (e.g. *"Debt-to-Equity is 2.4$\sigma$ above peer average"*).
3. **Hybrid Generative Layer**:
   The output of the scoring engine is fed into an LLM (Claude/Gemini) via `/api/ai-prompt-data/{id}` to synthesize natural language narrative verdicts.

---

## ❓ Question 2: "Why did you choose these specific 7 metrics and not others?"

### 🎯 Quick 15-Second Pitch Defense:
> **"Revenue and net profit alone are vanity metrics — companies like Bed Bath & Beyond and Enron had billions in revenue right before collapsing. Our 7 dimensions cover the 3 core pillars of corporate finance: Growth, Solvency, and Liquidity — matching institutional CAMELS frameworks."**

### 📊 The 7 Dimension Breakdown:

| Metric Chosen | Financial Pillar | Why it is Essential |
| :--- | :--- | :--- |
| **YoY Revenue Growth** | Growth & Scale | Measures top-line business expansion and market share velocity. |
| **Net Profit Margin** | Operational Efficiency | Measures how much actual profit remains after all operational costs. |
| **Cash Conversion Ratio** *(OCF / Net Income)* | Earnings Quality | **Crucial Anti-Fraud Metric**: Detects accounting manipulation (e.g. high paper profits with zero real cash flow). |
| **Debt-to-Equity Ratio** | Solvency & Financial Leverage | High leverage in rising interest rate environments is the #1 cause of bankruptcy. |
| **Current Ratio** | Short-Term Liquidity | Measures ability to pay off immediate liabilities due within 12 months. |
| **Working Capital / Revenue** | Cash Flow Velocity | Measures operational efficiency in managing inventory and receivables. |
| **Revenue Std Dev Ratio** | Business Stability | Distinguishes steady, predictable revenues from erratic, high-risk cyclical swings. |

---

## ❓ Question 3: "What if we want to change or add metrics?"

### 🎯 Quick 15-Second Pitch Defense:
> **"Our backend uses a modular, weight-normalized scoring architecture. Adding or swapping a metric (e.g. Return on Equity or Quick Ratio) takes under 5 minutes without re-engineering the system."**

### 🛠️ How Metric Swapping Works in Code:

1. **Modular Weight System** (`engine/scoring.py`):
   ```python
   # Easily add/modify dimension weights (Must sum to 1.0)
   WEIGHTS = {
       "revenue_growth": 0.20,
       "profitability": 0.20,
       "cash_conversion": 0.15,
       "debt_health": 0.15,
       "liquidity": 0.10,
       "working_capital": 0.10,
       "stability": 0.10
   }
   ```
2. **Auto-Adapting Peer Anomaly Engine**:
   The Z-Score engine (`calculate_peer_anomalies`) dynamically inspects whichever metric keys exist in `data/companies.json`. Adding a new line item (e.g. `"quick_ratio": 1.2`) automatically enables statistical peer outlier detection across all companies instantly.

---

## ❓ Question 4: "What if we change the UI?"

### 🎯 Quick 15-Second Pitch Defense:
> **"Our backend is built as a strict Headless RESTful Microservice. The frontend UI is 100% decoupled from the backend logic."**

### 🔌 Decoupled API Benefits:
* The backend (`main.py`) communicates exclusively via **standard JSON payloads**.
* Whether Person 2 builds the frontend using **React, Vue, Vite, Next.js, Tailwind, or even a mobile app in React Native/Flutter**:
  * Endpoints like `POST /api/simulate` and `POST /api/counterfactual` remain completely unchanged.
  * You can redesign the entire UI, swap radar chart libraries (Chart.js vs. Recharts vs. D3.js), or change color schemes without touching a single line of backend logic.
