import React, { useState, useEffect } from 'react';
import { CompanySummary, runMutation, MutationResponse, ShockQuarter } from '../api/client';
import { CompanySelector } from '../components/CompanySelector';
import { ErrorBanner } from '../components/ErrorBanner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { LineChart as LineIcon, Activity, Flame } from 'lucide-react';

interface MultiQuarterShocksPageProps {
  companies: CompanySummary[];
  selectedCompanyId: string;
  onSelectCompany: (id: string) => void;
  backendOnline: boolean | null;
}

export const MultiQuarterShocksPage: React.FC<MultiQuarterShocksPageProps> = ({
  companies,
  selectedCompanyId,
  onSelectCompany,
  backendOnline,
}) => {
  const [timeline, setTimeline] = useState<ShockQuarter[]>([
    { revenue_change_pct: -5, cost_increase_pct: 2, debt_increase_pct: 0, cash_flow_drop_pct: 5 },
    { revenue_change_pct: -12, cost_increase_pct: 6, debt_increase_pct: 10, cash_flow_drop_pct: 12 },
    { revenue_change_pct: -20, cost_increase_pct: 10, debt_increase_pct: 20, cash_flow_drop_pct: 20 },
    { revenue_change_pct: -30, cost_increase_pct: 15, debt_increase_pct: 35, cash_flow_drop_pct: 30 },
  ]);

  const [mutationData, setMutationData] = useState<MutationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMutation = async () => {
    if (!selectedCompanyId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await runMutation({
        company_id: selectedCompanyId,
        shock_timeline: timeline,
      });
      setMutationData(res);
    } catch (err: any) {
      setError("Backend Offline. Failed to connect to http://localhost:8000/api/mutate");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMutation();
  }, [selectedCompanyId]);

  const updateQuarter = (index: number, key: keyof ShockQuarter, value: number) => {
    const next = [...timeline];
    next[index] = { ...next[index], [key]: value };
    setTimeline(next);
  };

  if (backendOnline === false || error) {
    return <ErrorBanner message={error || "Backend Offline"} onRetry={fetchMutation} />;
  }

  // Formatting chart data
  const chartData = mutationData?.mutation_history.map((item) => ({
    quarter: `Q${item.quarter}`,
    compositeScore: item.composite_score,
    revenueGrowth: item.sub_scores.revenue_growth,
    profitability: item.sub_scores.profitability,
    cashConversion: item.sub_scores.cash_conversion,
    debtHealth: item.sub_scores.debt_health,
    verdict: item.health_verdict,
  })) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="glass-panel p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <LineIcon className="text-indigo-400" size={22} />
            Multi-Quarter Compounding Mutation Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate sequential quarter-over-quarter compounding financial shocks and score decay
          </p>
        </div>

        <CompanySelector
          companies={companies}
          selectedId={selectedCompanyId}
          onSelectCompany={onSelectCompany}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Timeline Escalation Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-5">
            <h3 className="text-base font-semibold text-slate-100 mb-3 pb-2 border-b border-slate-800 flex items-center gap-2">
              <Flame size={16} className="text-rose-400" />
              Quarterly Shock Escalation Vector
            </h3>

            <div className="space-y-4">
              {timeline.map((q, idx) => (
                <div key={idx} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                    <span>Quarter {idx + 1} Shock Package</span>
                    <span className="font-mono text-slate-400">Q{idx + 1}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Rev Change %</label>
                      <input
                        type="number"
                        value={q.revenue_change_pct}
                        onChange={(e) => updateQuarter(idx, 'revenue_change_pct', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Cost Inflation %</label>
                      <input
                        type="number"
                        value={q.cost_increase_pct}
                        onChange={(e) => updateQuarter(idx, 'cost_increase_pct', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Debt Increase %</label>
                      <input
                        type="number"
                        value={q.debt_increase_pct}
                        onChange={(e) => updateQuarter(idx, 'debt_increase_pct', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Cash Drop %</label>
                      <input
                        type="number"
                        value={q.cash_flow_drop_pct}
                        onChange={(e) => updateQuarter(idx, 'cash_flow_drop_pct', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={fetchMutation}
              disabled={loading}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Activity size={16} /> Run Multi-Quarter Mutation
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Evolution Line Chart */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6">
            <h3 className="text-base font-semibold text-slate-100 mb-4 pb-2 border-b border-slate-800">
              Compounding Score Trajectory
            </h3>

            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="quarter" stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: 'rgba(99, 102, 241, 0.4)',
                      borderRadius: '12px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="compositeScore"
                    name="Composite Score"
                    stroke="#38bdf8"
                    strokeWidth={3}
                    dot={{ r: 6, fill: '#38bdf8' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="profitability"
                    name="Profitability"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                  />
                  <Line
                    type="monotone"
                    dataKey="debtHealth"
                    name="Debt Health"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mutation History Table */}
          {mutationData && (
            <div className="glass-panel p-6">
              <h3 className="text-sm font-semibold text-slate-200 mb-3">
                Quarterly Decay Log
              </h3>
              <div className="space-y-2">
                {mutationData.mutation_history.map((item) => (
                  <div
                    key={item.quarter}
                    className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-cyan-400">Q{item.quarter}</span>
                      <span className="text-slate-300 font-medium">{item.health_verdict}</span>
                    </div>
                    <div className="font-mono font-bold text-slate-100">
                      Score: {item.composite_score.toFixed(1)} / 100
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
