import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface SubScores {
  revenue_growth: number;
  profitability: number;
  cash_conversion: number;
  debt_health: number;
  liquidity: number;
  working_capital: number;
  stability: number;
}

export interface CompanyMetrics {
  revenue_growth: number;
  net_profit_margin: number;
  cash_conversion: number;
  debt_to_equity: number;
  current_ratio: number;
  working_capital_ratio: number;
  revenue_std_dev_ratio: number;
}

export interface CompanySummary {
  id: string;
  name: string;
  ticker: string;
  sector: string;
  description?: string;
  composite_score: number;
  health_verdict: string;
  sub_scores: SubScores;
  metrics: CompanyMetrics;
}

export interface PeerAnomaly {
  metric: string;
  company_value: number;
  peer_mean: number;
  peer_std: number;
  z_score: number;
  is_outlier: boolean;
  anomaly_type: string;
  description: string;
}

export interface DnaScore {
  composite_score: number;
  health_verdict: string;
  sub_scores: SubScores;
}

export interface CompanyDetailResponse {
  company: CompanySummary;
  dna_score: DnaScore;
  peer_anomalies: PeerAnomaly[];
}

export interface SimulateRequest {
  company_id: str;
  revenue_change_pct: number;
  cost_increase_pct: number;
  debt_increase_pct: number;
  cash_flow_drop_pct: number;
}

export interface SimulateResponse {
  original_dna: DnaScore;
  simulated_dna: DnaScore;
  score_delta: number;
  needle_mover: {
    primary_driver: string;
    impact_pct: number;
    summary: string;
  };
  recovery_timeline: {
    estimated_quarters_to_recover: number;
    recommendation: string;
  };
}

export interface MinimumFix {
  action: string;
  lever: string;
  requirement: string;
  resulting_score: number;
}

export interface CounterfactualResponse {
  status: string;
  current_score: number;
  target_score: number;
  score_gap: number;
  minimum_fixes: MinimumFix[];
}

export interface ShockQuarter {
  revenue_change_pct: number;
  cost_increase_pct: number;
  debt_increase_pct: number;
  cash_flow_drop_pct: number;
}

export interface MutationRequest {
  company_id: string;
  shock_timeline: ShockQuarter[];
}

export interface MutationHistoryItem {
  quarter: number;
  shock: ShockQuarter;
  composite_score: number;
  health_verdict: string;
  sub_scores: SubScores;
}

export interface MutationResponse {
  company_id: string;
  company_name: string;
  mutation_history: MutationHistoryItem[];
}

export interface CalculateScoreRequest {
  revenue_growth: number;
  net_profit_margin: number;
  cash_conversion: number;
  debt_to_equity: number;
  current_ratio: number;
  working_capital_ratio: number;
  revenue_std_dev_ratio: number;
}

export interface CalculateScoreResponse {
  status: string;
  composite_score: number;
  health_verdict: string;
  sub_scores: SubScores;
  peer_anomalies?: PeerAnomaly[];
  raw_metrics?: CompanyMetrics;
}

export interface AIPromptResponse {
  company_id: string;
  formatted_llm_prompt: string;
}

type str = string;

// API Functions
export const fetchCompanies = async (): Promise<CompanySummary[]> => {
  const response = await apiClient.get('/api/companies');
  return response.data.companies;
};

export const fetchCompanyDetail = async (companyId: string): Promise<CompanyDetailResponse> => {
  const response = await apiClient.get(`/api/companies/${companyId}`);
  return response.data;
};

export const runSimulation = async (payload: SimulateRequest): Promise<SimulateResponse> => {
  const response = await apiClient.post('/api/simulate', payload);
  return response.data;
};

export const runCounterfactual = async (
  companyId: string,
  targetScore: number = 70.0
): Promise<CounterfactualResponse> => {
  const response = await apiClient.post('/api/counterfactual', {
    company_id: companyId,
    target_score: targetScore,
  });
  return response.data;
};

export const runMutation = async (payload: MutationRequest): Promise<MutationResponse> => {
  const response = await apiClient.post('/api/mutate', payload);
  return response.data;
};

export const calculateCustomScore = async (
  metrics: CalculateScoreRequest
): Promise<CalculateScoreResponse> => {
  const response = await apiClient.post('/api/calculate-score', metrics);
  return response.data;
};

export const fetchAIPromptData = async (companyId: string): Promise<AIPromptResponse> => {
  const response = await apiClient.get(`/api/ai-prompt-data/${companyId}`);
  return response.data;
};
