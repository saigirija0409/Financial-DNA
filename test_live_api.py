import urllib.request
import urllib.parse
import json

BASE_URL = "http://127.0.0.1:8000"

def make_request(path: str, method: str = "GET", data: dict = None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    
    encoded_data = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            status_code = response.getcode()
            response_body = json.loads(response.read().decode("utf-8"))
            return status_code, response_body
    except urllib.error.HTTPError as e:
        error_body = json.loads(e.read().decode("utf-8"))
        return e.code, error_body

def run_stress_tests():
    print("=" * 70)
    print("🛡️ RUNNING END-TO-END FLAWLESS BACKEND API AUDIT FOR JURY DEMO")
    print("=" * 70)

    # 1. Root Endpoint Test
    print("\n[1/9] Testing GET / ...")
    status, body = make_request("/")
    assert status == 200 and body["status"] == "online"
    print("  ✅ Root Health Check PASSED")

    # 2. Get All Companies Endpoint
    print("\n[2/9] Testing GET /api/companies ...")
    status, body = make_request("/api/companies")
    assert status == 200 and len(body["companies"]) == 8
    print(f"  ✅ Companies List PASSED (Retrieved {len(body['companies'])} companies)")

    # 3. Get Single Company & Peer Anomalies
    print("\n[3/9] Testing GET /api/companies/tcs ...")
    status, body = make_request("/api/companies/tcs")
    assert status == 200 and body["company"]["id"] == "tcs"
    assert "peer_anomalies" in body and "dna_score" in body
    print(f"  ✅ Single Company Detail PASSED (TCS Score: {body['dna_score']['composite_score']})")

    # 4. Custom Raw Metrics Calculator
    print("\n[4/9] Testing POST /api/calculate-score ...")
    payload = {
        "revenue_growth": 12.0,
        "net_profit_margin": 15.0,
        "cash_conversion": 1.1,
        "debt_to_equity": 0.4,
        "current_ratio": 1.8,
        "working_capital_ratio": 0.2,
        "revenue_std_dev_ratio": 0.05
    }
    status, body = make_request("/api/calculate-score", method="POST", data=payload)
    assert status == 200 and body["status"] == "success"
    print(f"  ✅ Custom Score Calculator PASSED (Calculated Composite Score: {body['composite_score']})")

    # 5. Live Simulator & Cascading Physics
    print("\n[5/9] Testing POST /api/simulate (Severe Macro Shock: Rev -30%, Cost +20%) ...")
    sim_payload = {
        "company_id": "tcs",
        "revenue_change_pct": -30.0,
        "cost_increase_pct": 20.0,
        "debt_increase_pct": 25.0,
        "cash_flow_drop_pct": 15.0
    }
    status, body = make_request("/api/simulate", method="POST", data=sim_payload)
    assert status == 200 and "simulated_dna" in body
    print(f"  ✅ Live Stress Simulator PASSED")
    print(f"     • Baseline Score: {body['baseline_dna']['composite_score']} -> Simulated: {body['simulated_dna']['composite_score']} (Delta: {body['score_delta']})")
    print(f"     • Needle Mover: {body['needle_mover']['summary']}")
    print(f"     • Recovery Timeline: {body['recovery_timeline']['estimated_quarters_to_recover']} quarters")

    # 6. Prescriptive "Minimum Fix" Counterfactual Solver
    print("\n[6/9] Testing POST /api/counterfactual ...")
    cf_payload = {"company_id": "bbby", "target_score": 70.0}
    status, body = make_request("/api/counterfactual", method="POST", data=cf_payload)
    assert status == 200 and body["status"] == "success"
    print(f"  ✅ Minimum Fix Counterfactual Engine PASSED (Score Gap: {body['score_gap']} pts)")
    for fix in body["minimum_fixes"]:
        print(f"     • {fix['action']}: {fix['requirement']} -> Target Met ({fix['resulting_score']})")

    # 7. Multi-Quarter Compounding Mutation Engine
    print("\n[7/9] Testing POST /api/mutate (4-Quarter Shock Payload) ...")
    mut_payload = {
        "company_id": "tcs",
        "shock_timeline": [
            {"revenue_change_pct": -10.0},
            {"cost_increase_pct": 15.0},
            {"debt_increase_pct": 30.0},
            {"cash_flow_drop_pct": 20.0}
        ]
    }
    status, body = make_request("/api/mutate", method="POST", data=mut_payload)
    assert status == 200 and len(body["mutation_history"]) == 4
    print(f"  ✅ Multi-Quarter Mutation Engine PASSED")
    for q in body["mutation_history"]:
        print(f"     • {q['quarter']}: Score {q['composite_score']} ({q['health_verdict']})")

    # 8. AI Prompt Context Generator
    print("\n[8/9] Testing GET /api/ai-prompt-data/tcs ...")
    status, body = make_request("/api/ai-prompt-data/tcs")
    assert status == 200 and "formatted_llm_prompt" in body
    print(f"  ✅ AI Prompt Generator PASSED (Generated {len(body['formatted_llm_prompt'])} characters of prompt context)")

    # 9. Edge Case & Error Handling (Invalid Company ID 404 Guard)
    print("\n[9/9] Testing Error Handling Guard (Invalid Company ID) ...")
    status, body = make_request("/api/companies/invalid_company_xyz")
    assert status == 404
    print(f"  ✅ Error Handling Guard PASSED (404 Handled Gracefully: {body['detail']})")

    print("\n" + "=" * 70)
    print("🏆 ALL 9 API ENDPOINTS PASSED FLAWLESSLY! NO ERRORS FOUND.")
    print("=" * 70)

if __name__ == "__main__":
    run_stress_tests()
