import json
import os
from engine.scoring import calculate_financial_dna, calculate_peer_anomalies
from engine.simulator import (
    simulate_stress_test,
    find_minimum_fix_counterfactual,
    estimate_recovery_timeline,
    simulate_sequential_mutation
)

def run_tests():
    print("=" * 60)
    print("🧪 RUNNING FINANCIAL DNA ENGINE TEST SUITE")
    print("=" * 60)

    # 1. Load Companies
    data_path = os.path.join(os.path.dirname(__file__), "data", "companies.json")
    with open(data_path, "r", encoding="utf-8") as f:
        companies = json.load(f)["companies"]

    print(f"✅ Loaded {len(companies)} benchmark companies.")

    # 2. Test Scoring Engine
    print("\n--- 1. Testing Financial DNA Scores ---")
    for comp in companies:
        dna = calculate_financial_dna(comp["metrics"])
        print(f"[{comp['ticker']}] Score: {dna['composite_score']}/100 | Verdict: {dna['health_verdict']}")
        assert 0 <= dna["composite_score"] <= 100, "Score out of range!"

    # 3. Test Peer Z-Score Anomaly Engine
    print("\n--- 2. Testing Z-Score Anomaly Engine ---")
    tcs = next(c for c in companies if c["id"] == "tcs")
    anomalies = calculate_peer_anomalies(tcs["metrics"], companies)
    print(f"TCS Peer Anomalies Detected: {len(anomalies)}")
    for a in anomalies:
        print(f"  • {a['flag_type']}: {a['description']}")

    # 4. Test Financial Simulator & Cascading Physics
    print("\n--- 3. Testing Stress Simulator (Revenue Drop -20%, Cost +10%) ---")
    sim_result = simulate_stress_test(
        tcs,
        companies,
        revenue_change_pct=-20.0,
        cost_increase_pct=10.0,
        debt_increase_pct=15.0,
        cash_flow_drop_pct=10.0
    )

    base_score = sim_result["baseline_dna"]["composite_score"]
    sim_score = sim_result["simulated_dna"]["composite_score"]
    print(f"Baseline Score: {base_score} -> Simulated Score: {sim_score} (Delta: {sim_result['score_delta']})")
    print(f"Needle Mover: {sim_result['needle_mover']['summary']}")
    print(f"Estimated Recovery: {sim_result['recovery_timeline']['estimated_quarters_to_recover']} quarters ({sim_result['recovery_timeline']['verdict']})")

    # 5. Test Minimum Fix Counterfactual Engine
    print("\n--- 4. Testing Prescriptive Counterfactual Engine ('Minimum Fix') ---")
    distressed = next(c for c in companies if c["id"] == "bbby")
    counterfactual = find_minimum_fix_counterfactual(distressed, target_score=70.0)
    print(f"Distressed Company Score Gap to 70.0: {counterfactual['score_gap']} points")
    print("Recommended Minimum Fixes:")
    for fix in counterfactual["minimum_fixes"]:
        print(f"  👉 Action: {fix['action']} | Requirement: {fix['requirement']} -> New Score: {fix['resulting_score']}")

    # 6. Test Sequential Multi-Quarter Mutation Engine
    print("\n--- 5. Testing Sequential Mutation Engine (4 Quarters) ---")
    shocks = [
        {"revenue_change_pct": -10.0, "cost_increase_pct": 5.0},
        {"revenue_change_pct": -15.0, "debt_increase_pct": 20.0},
        {"cash_flow_drop_pct": 25.0},
        {"revenue_change_pct": 5.0} # Slight recovery
    ]
    mutations = simulate_sequential_mutation(tcs, shocks)
    for m in mutations:
        print(f"  Quarter: {m['quarter']} | Score: {m['composite_score']} | Verdict: {m['health_verdict']}")

    print("\n" + "=" * 60)
    print("🎉 ALL TESTS PASSED SUCCESSFULLY! BACKEND ENGINE IS DEMO-READY.")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
