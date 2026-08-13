import math
from typing import Dict, Any, List

# Define the 7 sub-dimension weights (Total = 1.0)
WEIGHTS = {
    "revenue_growth": 0.20,
    "profitability": 0.20,
    "cash_conversion": 0.15,
    "debt_health": 0.15,
    "liquidity": 0.10,
    "working_capital": 0.10,
    "stability": 0.10
}

def score_revenue_growth(growth: float) -> float:
    """YoY Revenue Growth % -> 0..100"""
    if growth >= 15.0:
        return 100.0
    elif growth >= 5.0:
        return 70.0 + (growth - 5.0) * (30.0 / 10.0)
    elif growth >= 0.0:
        return 40.0 + growth * (30.0 / 5.0)
    else:
        return max(0.0, 40.0 + growth * 2.0)

def score_profitability(margin: float) -> float:
    """Net Profit Margin % -> 0..100"""
    if margin >= 15.0:
        return 100.0
    elif margin >= 5.0:
        return 70.0 + (margin - 5.0) * (30.0 / 10.0)
    elif margin >= 0.0:
        return 40.0 + margin * (30.0 / 5.0)
    else:
        return max(0.0, 40.0 + margin * 2.5)

def score_cash_conversion(ratio: float) -> float:
    """Operating Cash Flow / Net Income -> 0..100"""
    if ratio >= 1.0:
        return 100.0
    elif ratio >= 0.7:
        return 70.0 + (ratio - 0.7) * (30.0 / 0.3)
    elif ratio >= 0.0:
        return 30.0 + ratio * (40.0 / 0.7)
    else:
        return 0.0

def score_debt_health(de_ratio: float) -> float:
    """Debt to Equity Ratio (Lower is healthier) -> 0..100"""
    if de_ratio <= 0.5:
        return 100.0
    elif de_ratio <= 1.0:
        return 70.0 + (1.0 - de_ratio) * (30.0 / 0.5)
    elif de_ratio <= 2.0:
        return 40.0 + (2.0 - de_ratio) * (30.0 / 1.0)
    else:
        return max(0.0, 40.0 - (de_ratio - 2.0) * 15.0)

def score_liquidity(current_ratio: float) -> float:
    """Current Ratio (Current Assets / Current Liabilities) -> 0..100"""
    if current_ratio >= 2.0:
        return 100.0
    elif current_ratio >= 1.5:
        return 75.0 + (current_ratio - 1.5) * (25.0 / 0.5)
    elif current_ratio >= 1.0:
        return 50.0 + (current_ratio - 1.0) * (25.0 / 0.5)
    else:
        return max(0.0, current_ratio * 50.0)

def score_working_capital(wc_ratio: float) -> float:
    """Working Capital / Revenue -> 0..100"""
    if wc_ratio >= 0.15:
        return 100.0
    elif wc_ratio >= 0.0:
        return 60.0 + (wc_ratio) * (40.0 / 0.15)
    else:
        return max(0.0, 60.0 + wc_ratio * 150.0)

def score_stability(std_dev_ratio: float) -> float:
    """Revenue Std Dev / Mean (Lower variance = higher stability) -> 0..100"""
    if std_dev_ratio <= 0.05:
        return 100.0
    elif std_dev_ratio <= 0.20:
        return 100.0 - (std_dev_ratio - 0.05) * (60.0 / 0.15)
    else:
        return max(10.0, 40.0 - (std_dev_ratio - 0.20) * 100.0)

def calculate_financial_dna(metrics: Dict[str, float]) -> Dict[str, Any]:
    """
    Computes sub-dimension scores and composite Financial DNA score.
    Returns detailed radar chart dimensions and health category.
    """
    sub_scores = {
        "revenue_growth": round(score_revenue_growth(metrics.get("revenue_growth", 0)), 1),
        "profitability": round(score_profitability(metrics.get("net_profit_margin", 0)), 1),
        "cash_conversion": round(score_cash_conversion(metrics.get("cash_conversion", 0)), 1),
        "debt_health": round(score_debt_health(metrics.get("debt_to_equity", 0)), 1),
        "liquidity": round(score_liquidity(metrics.get("current_ratio", 0)), 1),
        "working_capital": round(score_working_capital(metrics.get("working_capital_ratio", 0)), 1),
        "stability": round(score_stability(metrics.get("revenue_std_dev_ratio", 0)), 1)
    }

    # Weighted Composite Score
    composite_score = sum(sub_scores[k] * WEIGHTS[k] for k in WEIGHTS)
    composite_score = round(composite_score, 1)

    # Health Verdict Category
    if composite_score >= 80:
        verdict = "Fortress Health (Resilient & Elite)"
    elif composite_score >= 65:
        verdict = "Stable Growth (Healthy Foundation)"
    elif composite_score >= 45:
        verdict = "Moderate Risk (Vulnerable to Shocks)"
    else:
        verdict = "Distressed / High Risk of Collapse"

    return {
        "composite_score": composite_score,
        "health_verdict": verdict,
        "sub_scores": sub_scores,
        "dimension_weights": WEIGHTS,
        "raw_metrics": metrics
    }

def calculate_peer_anomalies(target_company_metrics: Dict[str, float], peer_companies: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Calculates Z-scores for each metric against the peer dataset to detect statistical anomalies/outliers.
    Returns anomaly flags for judge presentation.
    """
    anomalies = []
    metric_keys = [
        ("revenue_growth", "Revenue Growth Rate"),
        ("net_profit_margin", "Net Profit Margin"),
        ("cash_conversion", "Cash Conversion Ratio"),
        ("debt_to_equity", "Debt-to-Equity Ratio"),
        ("current_ratio", "Current Ratio"),
        ("working_capital_ratio", "Working Capital / Rev"),
        ("revenue_std_dev_ratio", "Revenue Variance")
    ]

    for key, label in metric_keys:
        values = [c["metrics"][key] for c in peer_companies if key in c["metrics"]]
        if len(values) < 2:
            continue
        
        mean_val = sum(values) / len(values)
        variance = sum((x - mean_val) ** 2 for x in values) / (len(values) - 1)
        std_dev = math.sqrt(variance) if variance > 0 else 0.001

        val = target_company_metrics.get(key, 0.0)
        z_score = (val - mean_val) / std_dev
        z_score = round(z_score, 2)

        # Flag outliers beyond 1.2 std deviations
        if abs(z_score) >= 1.2:
            severity = "High Outlier" if abs(z_score) >= 1.8 else "Moderate Outlier"
            direction = "above" if z_score > 0 else "below"
            
            # Risk vs Strength assessment
            if (key == "debt_to_equity" and z_score > 0) or (key != "debt_to_equity" and z_score < 0):
                flag_type = "WARNING / RISK FLAG"
            else:
                flag_type = "OUTPERFORMER / STRENGTH"

            anomalies.append({
                "metric": label,
                "key": key,
                "value": val,
                "peer_mean": round(mean_val, 2),
                "z_score": z_score,
                "severity": severity,
                "direction": direction,
                "flag_type": flag_type,
                "description": f"{label} is {abs(z_score)} std devs {direction} peer average ({round(mean_val, 2)})."
            })

    return anomalies
