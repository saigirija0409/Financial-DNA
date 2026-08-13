from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import json
import os

from engine.scoring import calculate_financial_dna, calculate_peer_anomalies
from engine.simulator import (
    simulate_stress_test,
    find_minimum_fix_counterfactual,
    estimate_recovery_timeline,
    simulate_sequential_mutation
)

app = FastAPI(
    title="Financial DNA Engine API",
    description="Deterministic Financial Health Scoring, Peer Z-Score Anomaly Engine, and Cascading Stress Simulator",
    version="1.0.0"
)

# Enable CORS for frontend integration (React, Vue, Vite, Vanilla JS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Benchmark Companies Dataset
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "companies.json")

def load_companies() -> List[Dict[str, Any]]:
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Companies dataset not found at {DATA_PATH}")
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
        return data.get("companies", [])

# Request Pydantic Models
class RawScoreRequest(BaseModel):
    revenue_growth: Optional[float] = Field(10.0, description="YoY Growth %")
    net_profit_margin: Optional[float] = Field(12.0, description="Net Margin %")
    cash_conversion: Optional[float] = Field(1.0, description="OCF / Net Income")
    debt_to_equity: Optional[float] = Field(0.5, description="Debt / Equity ratio")
    current_ratio: Optional[float] = Field(1.5, description="Current Assets / Current Liabilities")
    working_capital_ratio: Optional[float] = Field(0.15, description="Working Capital / Revenue")
    revenue_std_dev_ratio: Optional[float] = Field(0.08, description="Quarterly Variance ratio")

class SimulationRequest(BaseModel):
    company_id: str
    revenue_change_pct: float = Field(0.0, ge=-50.0, le=50.0, description="Revenue change % (-50 to +50)")
    cost_increase_pct: float = Field(0.0, ge=0.0, le=50.0, description="Cost increase % (0 to 50)")
    debt_increase_pct: float = Field(0.0, ge=0.0, le=100.0, description="Debt increase % (0 to 100)")
    cash_flow_drop_pct: float = Field(0.0, ge=0.0, le=50.0, description="Cash flow drop % (0 to 50)")

class CounterfactualRequest(BaseModel):
    company_id: str
    target_score: Optional[float] = Field(70.0, ge=0.0, le=100.0)

class MutationRequest(BaseModel):
    company_id: str
    shock_timeline: List[Dict[str, float]]

# REST API Endpoints
@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Financial DNA & Stress Simulator Engine",
        "version": "1.0.0",
        "pitch_tagline": "Turning balance sheets into visual DNA fingerprints and prescriptive stress tests."
    }

@app.get("/api/companies")
def get_companies():
    """Returns list of all pre-loaded benchmark companies with baseline Financial DNA scores."""
    companies = load_companies()
    results = []
    for comp in companies:
        dna = calculate_financial_dna(comp["metrics"])
        results.append({
            "id": comp["id"],
            "name": comp["name"],
            "ticker": comp["ticker"],
            "sector": comp["sector"],
            "description": comp["description"],
            "composite_score": dna["composite_score"],
            "health_verdict": dna["health_verdict"],
            "sub_scores": dna["sub_scores"],
            "metrics": comp["metrics"]
        })
    return {"companies": results}

@app.get("/api/companies/{company_id}")
def get_company_detail(company_id: str):
    """Returns detailed Financial DNA score, radar sub-scores, and Peer Z-Score anomalies."""
    companies = load_companies()
    company = next((c for c in companies if c["id"].lower() == company_id.lower()), None)
    if not company:
        raise HTTPException(status_code=404, detail=f"Company with ID '{company_id}' not found.")

    base_dna = calculate_financial_dna(company["metrics"])
    anomalies = calculate_peer_anomalies(company["metrics"], companies)

    return {
        "company": company,
        "dna_score": base_dna,
        "peer_anomalies": anomalies
    }

@app.post("/api/calculate-score")
def calculate_raw_score(req: RawScoreRequest):
    """
    Direct scoring API endpoint: accepts custom financial metrics and returns Financial DNA score.
    """
    metrics = {
        "revenue_growth": req.revenue_growth,
        "net_profit_margin": req.net_profit_margin,
        "cash_conversion": req.cash_conversion,
        "debt_to_equity": req.debt_to_equity,
        "current_ratio": req.current_ratio,
        "working_capital_ratio": req.working_capital_ratio,
        "revenue_std_dev_ratio": req.revenue_std_dev_ratio
    }

    dna = calculate_financial_dna(metrics)
    companies = load_companies()
    anomalies = calculate_peer_anomalies(metrics, companies)

    return {
        "status": "success",
        "composite_score": dna["composite_score"],
        "health_verdict": dna["health_verdict"],
        "sub_scores": dna["sub_scores"],
        "peer_anomalies": anomalies,
        "raw_metrics": metrics
    }

@app.post("/api/simulate")
def run_simulation(req: SimulationRequest):
    """
    Runs live financial simulator with cascading physics, needle-mover attribution, and recovery timeline.
    """
    companies = load_companies()
    company = next((c for c in companies if c["id"].lower() == req.company_id.lower()), None)
    if not company:
        raise HTTPException(status_code=404, detail=f"Company with ID '{req.company_id}' not found.")

    return simulate_stress_test(
        company,
        companies,
        req.revenue_change_pct,
        req.cost_increase_pct,
        req.debt_increase_pct,
        req.cash_flow_drop_pct
    )

@app.post("/api/counterfactual")
def run_counterfactual(req: CounterfactualRequest):
    """
    Prescriptive Counterfactual Engine ('Minimum Fix Solver').
    Answers: What is the smallest operational change needed to achieve target score?
    """
    companies = load_companies()
    company = next((c for c in companies if c["id"].lower() == req.company_id.lower()), None)
    if not company:
        raise HTTPException(status_code=404, detail=f"Company with ID '{req.company_id}' not found.")

    return find_minimum_fix_counterfactual(company, req.target_score)

@app.post("/api/mutate")
def run_mutation(req: MutationRequest):
    """
    Multi-Quarter Compounding Mutation Engine.
    Simulates compounding sequential shocks over quarters.
    """
    companies = load_companies()
    company = next((c for c in companies if c["id"].lower() == req.company_id.lower()), None)
    if not company:
        raise HTTPException(status_code=404, detail=f"Company with ID '{req.company_id}' not found.")

    mutation_result = simulate_sequential_mutation(company, req.shock_timeline)
    return {
        "company_id": company["id"],
        "company_name": company["name"],
        "mutation_history": mutation_result
    }

@app.get("/api/ai-prompt-data/{company_id}")
def get_ai_prompt_context(company_id: str):
    """
    Returns structured text representation ready to feed straight into an LLM prompt (Claude / Gemini API).
    """
    companies = load_companies()
    company = next((c for c in companies if c["id"].lower() == company_id.lower()), None)
    if not company:
        raise HTTPException(status_code=404, detail=f"Company with ID '{company_id}' not found.")

    base_dna = calculate_financial_dna(company["metrics"])
    anomalies = calculate_peer_anomalies(company["metrics"], companies)

    prompt_context = f"""
Given this company's financial profile:
- Company Name: {company['name']} ({company['ticker']}) - Sector: {company['sector']}
- Overall Financial DNA Score: {base_dna['composite_score']}/100 ({base_dna['health_verdict']})

Sub-dimension Scores (0-100):
- Revenue Growth Score: {base_dna['sub_scores']['revenue_growth']}/100 (YoY Growth: {company['metrics']['revenue_growth']}%)
- Profitability Score: {base_dna['sub_scores']['profitability']}/100 (Net Margin: {company['metrics']['net_profit_margin']}%)
- Cash Conversion Score: {base_dna['sub_scores']['cash_conversion']}/100 (OCF/Net Income: {company['metrics']['cash_conversion']})
- Debt Health Score: {base_dna['sub_scores']['debt_health']}/100 (Debt-to-Equity: {company['metrics']['debt_to_equity']})
- Liquidity Score: {base_dna['sub_scores']['liquidity']}/100 (Current Ratio: {company['metrics']['current_ratio']})
- Working Capital Score: {base_dna['sub_scores']['working_capital']}/100 (WC/Rev Ratio: {company['metrics']['working_capital_ratio']})
- Stability Score: {base_dna['sub_scores']['stability']}/100 (Quarterly Variance: {company['metrics']['revenue_std_dev_ratio']})

Key Peer Statistical Outliers:
{chr(10).join(['- ' + a['description'] for a in anomalies]) if anomalies else 'No significant statistical anomalies detected.'}

Task: Write a concise 3-sentence executive verdict:
1. Overall resilience verdict.
2. Primary core strength.
3. Biggest vulnerability or operational risk to monitor.
"""

    return {
        "company_id": company_id,
        "formatted_llm_prompt": prompt_context.strip()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

