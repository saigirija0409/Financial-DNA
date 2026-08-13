from typing import Dict, Any, List
import copy
from engine.scoring import calculate_financial_dna, calculate_peer_anomalies

def apply_cascading_physics(base_metrics: Dict[str, float],
                           revenue_change_pct: float,
                           cost_increase_pct: float,
                           debt_increase_pct: float,
                           cash_flow_drop_pct: float) -> Dict[str, float]:
    """
    Cascades financial shocks realistically:
    - Revenue Drop -> Squeezes margin (fixed overhead cost drag) + degrades working capital
    - Cost Increase -> Direct Net Profit Margin compression
    - Debt Increase -> Increases D/E ratio and strains Current Ratio
    - Cash Flow Drop -> Directly degrades Cash Conversion ratio
    """
    simulated = copy.deepcopy(base_metrics)

    rev_factor = 1.0 + (revenue_change_pct / 100.0)
    cost_factor = 1.0 + (cost_increase_pct / 100.0)
    debt_factor = 1.0 + (debt_increase_pct / 100.0)
    cash_factor = 1.0 - (cash_flow_drop_pct / 100.0)

    # 1. Revenue Growth recalculation
    simulated["revenue_growth"] = round(base_metrics["revenue_growth"] + revenue_change_pct, 2)

    # 2. Margin squeeze (Revenue drop + Overhead cost drag + Direct cost increase)
    # Fixed cost leverage factor: revenue drop affects net margin disproportionately
    margin_drag = (revenue_change_pct * 0.45 if revenue_change_pct < 0 else revenue_change_pct * 0.3)
    margin_cost_impact = (cost_increase_pct * 0.6)
    simulated["net_profit_margin"] = round(base_metrics["net_profit_margin"] + margin_drag - margin_cost_impact, 2)

    # 3. Debt to Equity Expansion
    simulated["debt_to_equity"] = round(base_metrics["debt_to_equity"] * debt_factor, 2)

    # 4. Cash Conversion Decay
    simulated["cash_conversion"] = round(max(0.0, base_metrics["cash_conversion"] * cash_factor * (0.95 if revenue_change_pct < 0 else 1.0)), 2)

    # 5. Liquidity / Current Ratio Impact from Debt Shock
    current_ratio_decay = (debt_increase_pct / 100.0) * 0.25
    simulated["current_ratio"] = round(max(0.2, base_metrics["current_ratio"] * (1.0 - current_ratio_decay)), 2)

    # 6. Working Capital Efficiency Impact
    wc_impact = (revenue_change_pct / 100.0) * 0.1
    simulated["working_capital_ratio"] = round(base_metrics["working_capital_ratio"] + wc_impact, 2)

    # 7. Volatility / Std Dev Ratio increases under extreme shocks
    shock_severity = (abs(revenue_change_pct) + cost_increase_pct + debt_increase_pct + cash_flow_drop_pct) / 200.0
    simulated["revenue_std_dev_ratio"] = round(base_metrics["revenue_std_dev_ratio"] + shock_severity * 0.1, 2)

    return simulated

def simulate_stress_test(company: Dict[str, Any],
                         peer_companies: List[Dict[str, Any]],
                         revenue_change_pct: float = 0.0,
                         cost_increase_pct: float = 0.0,
                         debt_increase_pct: float = 0.0,
                         cash_flow_drop_pct: float = 0.0) -> Dict[str, Any]:
    """
    Runs baseline score vs simulated score and provides dimension attribution & needle-mover analysis.
    """
    base_metrics = company["metrics"]
    baseline_result = calculate_financial_dna(base_metrics)

    # Apply Cascading Physics
    simulated_metrics = apply_cascading_physics(
        base_metrics,
        revenue_change_pct,
        cost_increase_pct,
        debt_increase_pct,
        cash_flow_drop_pct
    )

    simulated_result = calculate_financial_dna(simulated_metrics)

    # Score Delta
    score_delta = round(simulated_result["composite_score"] - baseline_result["composite_score"], 1)

    # Calculate dimension shift / needle movers
    dimension_deltas = {}
    for dim in baseline_result["sub_scores"]:
        delta = round(simulated_result["sub_scores"][dim] - baseline_result["sub_scores"][dim], 1)
        dimension_deltas[dim] = delta

    # Find the dimension that dropped/increased the most
    sorted_deltas = sorted(dimension_deltas.items(), key=lambda item: item[1])
    biggest_hit = sorted_deltas[0] if sorted_deltas else ("none", 0.0)
    biggest_gain = sorted_deltas[-1] if sorted_deltas else ("none", 0.0)

    needle_mover = {
        "dimension": biggest_hit[0] if score_delta < 0 else biggest_gain[0],
        "delta": biggest_hit[1] if score_delta < 0 else biggest_gain[1],
        "summary": f"The biggest driver of change was '{biggest_hit[0]}' with a {biggest_hit[1]} point shift." if score_delta < 0 else f"The biggest gain was in '{biggest_gain[0]}' (+{biggest_gain[1]} pts)."
    }

    # Peer Anomalies under Simulation
    simulated_anomalies = calculate_peer_anomalies(simulated_metrics, peer_companies)

    res = {
        "company_id": company["id"],
        "company_name": company["name"],
        "baseline_dna": baseline_result,
        "simulated_dna": simulated_result,
        "score_delta": score_delta,
        "dimension_deltas": dimension_deltas,
        "needle_mover": needle_mover,
        "inputs": {
            "revenue_change_pct": revenue_change_pct,
            "cost_increase_pct": cost_increase_pct,
            "debt_increase_pct": debt_increase_pct,
            "cash_flow_drop_pct": cash_flow_drop_pct
        },
        "simulated_anomalies": simulated_anomalies
    }

    res["recovery_timeline"] = estimate_recovery_timeline(res)
    return res

def find_minimum_fix_counterfactual(company: Dict[str, Any], target_score: float = 70.0) -> Dict[str, Any]:
    """
    NOVEL FEATURE: Prescriptive Counterfactual Solver ("Minimum Fix").
    Answers: What is the smallest operational change needed to achieve a target score?
    """
    base_metrics = company["metrics"]
    base_dna = calculate_financial_dna(base_metrics)
    current_score = base_dna["composite_score"]

    if current_score >= target_score:
        return {
            "status": "already_achieved",
            "message": f"Company's current DNA score ({current_score}) already meets or exceeds target ({target_score}).",
            "recommendations": []
        }

    recommendations = []

    # Option 1: Reduce Debt
    for debt_reduction in range(5, 80, 5):
        test_metrics = copy.deepcopy(base_metrics)
        test_metrics["debt_to_equity"] = max(0.05, test_metrics["debt_to_equity"] * (1.0 - debt_reduction / 100.0))
        dna = calculate_financial_dna(test_metrics)
        if dna["composite_score"] >= target_score:
            recommendations.append({
                "action": "Reduce Total Debt / Leverage",
                "lever": "debt_to_equity",
                "requirement": f"Cut debt-to-equity ratio by {debt_reduction}% (from {base_metrics['debt_to_equity']} to {round(test_metrics['debt_to_equity'], 2)})",
                "resulting_score": dna["composite_score"]
            })
            break

    # Option 2: Expand Profit Margin
    for margin_boost in [1.0, 2.0, 3.0, 5.0, 8.0, 10.0, 15.0]:
        test_metrics = copy.deepcopy(base_metrics)
        test_metrics["net_profit_margin"] += margin_boost
        dna = calculate_financial_dna(test_metrics)
        if dna["composite_score"] >= target_score:
            recommendations.append({
                "action": "Expand Operational Net Profit Margin",
                "lever": "net_profit_margin",
                "requirement": f"Increase net profit margin by +{margin_boost}% (from {base_metrics['net_profit_margin']}% to {round(test_metrics['net_profit_margin'], 2)}%)",
                "resulting_score": dna["composite_score"]
            })
            break

    # Option 3: Improve Cash Conversion Ratio
    for cash_boost in [0.1, 0.2, 0.3, 0.4, 0.5]:
        test_metrics = copy.deepcopy(base_metrics)
        test_metrics["cash_conversion"] += cash_boost
        dna = calculate_financial_dna(test_metrics)
        if dna["composite_score"] >= target_score:
            recommendations.append({
                "action": "Accelerate Cash Flow & Working Capital Collections",
                "lever": "cash_conversion",
                "requirement": f"Boost Cash Conversion ratio by +{cash_boost} (from {base_metrics['cash_conversion']} to {round(test_metrics['cash_conversion'], 2)})",
                "resulting_score": dna["composite_score"]
            })
            break

    return {
        "status": "success",
        "current_score": current_score,
        "target_score": target_score,
        "score_gap": round(target_score - current_score, 1),
        "minimum_fixes": recommendations
    }

def estimate_recovery_timeline(simulated_result: Dict[str, Any]) -> Dict[str, Any]:
    """
    NOVEL FEATURE: Estimates quarters needed to recover back to baseline DNA score post-shock.
    """
    score_delta = simulated_result["score_delta"]
    if score_delta >= 0:
        return {
            "recovery_quarters": 0,
            "verdict": "No shock sustained. Financial DNA remains intact.",
            "recovery_difficulty": "None"
        }

    points_lost = abs(score_delta)
    # Typical quarterly score recovery velocity based on cash conversion health
    base_cash_conv = simulated_result["simulated_dna"]["raw_metrics"].get("cash_conversion", 0.8)
    quarterly_recovery_rate = max(1.5, base_cash_conv * 4.0)

    quarters_needed = round(points_lost / quarterly_recovery_rate, 1)

    if quarters_needed <= 2.0:
        difficulty = "Fast Recovery (1-2 quarters)"
    elif quarters_needed <= 4.0:
        difficulty = "Moderate Recovery (3-4 quarters)"
    else:
        difficulty = "Prolonged Stress (5+ quarters / Structural overhaul required)"

    return {
        "score_lost": points_lost,
        "estimated_quarters_to_recover": quarters_needed,
        "recovery_rate_per_quarter": round(quarterly_recovery_rate, 1),
        "verdict": difficulty
    }

def simulate_sequential_mutation(company: Dict[str, Any], shock_timeline: List[Dict[str, float]]) -> List[Dict[str, Any]]:
    """
    NOVEL FEATURE: Multi-Quarter Mutation Engine.
    Simulates compounding sequential shocks over quarters (Q1 -> Q2 -> Q3 -> Q4).
    """
    base_metrics = copy.deepcopy(company["metrics"])
    mutation_history = []

    current_metrics = copy.deepcopy(base_metrics)

    for i, shock in enumerate(shock_timeline, start=1):
        rev_change = shock.get("revenue_change_pct", 0.0)
        cost_inc = shock.get("cost_increase_pct", 0.0)
        debt_inc = shock.get("debt_increase_pct", 0.0)
        cash_drop = shock.get("cash_flow_drop_pct", 0.0)

        current_metrics = apply_cascading_physics(
            current_metrics, rev_change, cost_inc, debt_inc, cash_drop
        )

        dna = calculate_financial_dna(current_metrics)
        mutation_history.append({
            "quarter": f"Shock Q{i}",
            "shock_payload": shock,
            "composite_score": dna["composite_score"],
            "health_verdict": dna["health_verdict"],
            "sub_scores": dna["sub_scores"],
            "metrics": current_metrics
        })

    return mutation_history
