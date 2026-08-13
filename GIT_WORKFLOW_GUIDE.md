# 🐙 Flawless GitHub Integration & Team Collaboration Blueprint

Using GitHub for your hackathon is the **#1 secret to integrating seamlessly without merge conflicts or 3 AM code breakages**.

---

## 🏗️ 1. Recommended Repository Architecture (Monorepo)

Keep everything in **ONE GitHub Repository** (e.g. `Financial-DNA`). This allows all 3 team members to see the API contract, backend, and frontend in one place.

```
Financial-DNA/ (GitHub Root Repository)
├── backend/
│   ├── data/
│   │   └── companies.json
│   ├── engine/
│   │   ├── scoring.py
│   │   └── simulator.py
│   ├── main.py
│   ├── test_engine.py
│   └── requirements.txt
├── frontend/                     <-- Person 2 creates React app here
│   ├── src/
│   │   ├── components/
│   │   │   ├── RadarChart.jsx
│   │   │   ├── SimulatorSliders.jsx
│   │   │   └── CounterfactualView.jsx
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── API_CONTRACT_FOR_FRONTEND.md  <-- Contract both sides agree on!
├── README.md
└── .gitignore
```

---

## ⚡ 2. Step-by-Step GitHub Setup Guide for Person 1

### Step 1: Create a GitHub Repository online
1. Go to [GitHub.com](https://github.com/new) $\rightarrow$ Create a repository named `Financial-DNA`.
2. Do **NOT** check "Initialize with README" (we already have local files).

### Step 2: Push Local Code to GitHub
Run these 3 commands in your terminal:
```bash
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/Financial-DNA.git
git push -u origin main
```

---

## 🌿 3. Branching Strategy to Avoid Merge Conflicts

| Teammate | Role | Branch Name | What they work on |
| :--- | :--- | :--- | :--- |
| **Person 1** | Backend / Scoring Engine | `feature/backend` | Python scoring logic, FastAPI endpoints, dataset |
| **Person 2** | Frontend Dashboard | `feature/frontend` | React UI, Radar Charts, Sliders, API fetch calls |
| **Person 3** | AI Insights & Integration | `feature/ai-insights` | Claude/Gemini API wrapper, prompt styling, pitch slides |

### Rules of Engagement:
1. **`main` branch is SACRED**: Only pull request / merge working, tested code into `main`.
2. **Never edit the same file at the same time**:
   * Person 1 works ONLY inside `backend/` or `engine/`.
   * Person 2 works ONLY inside `frontend/`.
   * Person 3 works ONLY inside `ai-insights/` or LLM integration files.

---

## 🔄 4. Daily / Hourly Git Workflow for Teammates

### A. How Person 2 (Frontend) & Person 3 (AI) Clone the Repo
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/Financial-DNA.git
cd Financial-DNA
```

### B. Creating a Working Branch
```bash
# Person 2 creates her branch
git checkout -b feature/frontend

# Person 3 creates their branch
git checkout -b feature/ai-insights
```

### C. Saving & Pushing Work (Every 1–2 hours)
```bash
git add .
git commit -m "Add radar chart component and slider bindings"
git push origin feature/frontend
```

### D. Merging into `main` without conflict
When Person 2 finishes a feature:
```bash
git checkout main
git pull origin main
git merge feature/frontend
git push origin main
```

---

## 🛡️ 5. The "Flawless Contract-First" Integration Protocol

To ensure 0 gaps between Frontend and Backend:

1. **Lock the API Contract Early**: Person 1 and Person 2 review `API_CONTRACT_FOR_FRONTEND.md`. If a field name is changed (e.g. `score_delta`), both update the contract first.
2. **Test Endpoints with Postman / Browser First**: Before Person 2 writes React code, test the backend URL (`http://localhost:8000/api/simulate`) in browser/Postman.
3. **Mock Data Fallback**: Person 2 uses hardcoded mock JSON (matching `API_CONTRACT_FOR_FRONTEND.md`) inside React state until the backend server is plugged in.
4. **Integration Checkpoint (Hour 12)**: All 3 team members run Backend and Frontend locally together to verify slider movement $\rightarrow$ API call $\rightarrow$ state update.
