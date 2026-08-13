import React, { useState, useEffect } from 'react';
import { CompanySummary, runSimulation, SimulateResponse } from '../api/client';
import { CompanySelector } from '../components/CompanySelector';
import { SevenDimensionRadarChart } from '../components/RadarChart';
import { ErrorBanner } from '../components/ErrorBanner';
import { Sliders, RotateCcw, AlertOctagon, TrendingDown, Clock } from 'lucide-react';

interface StressSimulatorPageProps {
  companies: CompanySummary[];
  selectedCompanyId: string;
  onSelectCompany: (id: string) => void;
  backendOnline: boolean | null;
}

export const StressSimulatorPage: React.FC<StressSimulatorPageProps> = ({
  companies,
  selectedCompanyId,
  onSelectCompany,
  backendOnline,
}) => {
  const [sliders, setSliders] = useState({
    revenue_change_pct: -20,
    cost_increase_pct: 10,
    debt_increase_pct: 15,
    cash_flow_drop_pct: 10,
  });

  const [simResult, setSimResult] = useState<SimulateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeSimulation = async () => {
    if (!selectedCompanyId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await runSimulation({
        company_id: selectedCompanyId,
        ...sliders,
      });
      setSimResult(res);
    } catch (err: any) {
      setError("Backend Offline. Failed to connect to http://localhost:8000/api/simulate");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSimulation();
  }, [selectedCompanyId]);

  const resetSliders = () => {
    setSliders({
      revenue_change_pct: 0,
      cost_increase_pct: 0,
      debt_increase_pct: 0,
      cash_flow_drop_pct: 0,
    });
  };

  const selectedComp = companies.find((c) => c.id.toLowerCase() === selectedCompanyId.toLowerCase());

  if (backendOnline === false || error) {
    return <ErrorBanner message={error || "Backend Offline"} onRetry={executeSimulation} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="glass-panel p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="text-cyan-400" size={22} />
            Live Financial Stress Simulator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate macroeconomic & operational shocks in real-time with cascading score recalculation
          </p>
        </div>

        <CompanySelector
          companies={companies}
          selectedId={selectedCompanyId}
          onSelectCompany={onSelectCompany}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Shock Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <AlertOctagon size={18} className="text-rose-400" />
                Stress Vectors
              </h3>
              <button
                onClick={resetSliders}
                className="text-xs flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors"
              >
                <RotateCcw size={13} /> Reset
              </button>
            </div>

            <div className="space-y-5">
              {/* Slider 1: Revenue Change */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-300">Revenue Shock %</span>
                  <span className={`font-mono ${sliders.revenue_change_pct < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {sliders.revenue_change_pct > 0 ? `+${sliders.revenue_change_pct}` : sliders.revenue_change_pct}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={sliders.revenue_change_pct}
                  onChange={(e) => setSliders({ ...sliders, revenue_change_pct: parseFloat(e.target.value) })}
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>-50% (Severe Drop)</span>
                  <span>0%</span>
                  <span>+50% (Surge)</span>
                </div>
              </div>

              {/* Slider 2: Cost Increase */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-300">OPEX / Cost Inflation %</span>
                  <span className="font-mono text-amber-400">+{sliders.cost_increase_pct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={sliders.cost_increase_pct}
                  onChange={(e) => setSliders({ ...sliders, cost_increase_pct: parseFloat(e.target.value) })}
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>0%</span>
                  <span>+25%</span>
                  <span>+50% (Massive Cost Push)</span>
                </div>
              </div>

              {/* Slider 3: Debt Increase */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-300">Debt Burden Increase %</span>
                  <span className="font-mono text-rose-400">+{sliders.debt_increase_pct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="2"
                  value={sliders.debt_increase_pct}
                  onChange={(e) => setSliders({ ...sliders, debt_increase_pct: parseFloat(e.target.value) })}
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>0%</span>
                  <span>+50%</span>
                  <span>+100% (Leverage Spike)</span>
                </div>
              </div>

              {/* Slider 4: Cash Flow Drop */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-300">Operating Cash Flow Drop %</span>
                  <span className="font-mono text-rose-400">-{sliders.cash_flow_drop_pct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={sliders.cash_flow_drop_pct}
                  onChange={(e) => setSliders({ ...sliders, cash_flow_drop_pct: parseFloat(e.target.value) })}
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>0%</span>
                  <span>-25%</span>
                  <span>-50% (Cash Crunch)</span>
                </div>
              </div>
            </div>

            <button
              onClick={executeSimulation}
              disabled={loading}
              className="w-full mt-6 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Sliders size={16} /> Run Stress Test Simulation
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Results & Radar Overlay */}
        <div className="lg:col-span-7 space-y-6">
          {simResult && (
            <>
              {/* Score Shift Header Card */}
              <div className="glass-panel p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">Baseline DNA Score</div>
                  <div className="text-2xl font-bold font-mono text-slate-200">
                    {simResult.original_dna.composite_score.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{simResult.original_dna.health_verdict}</div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 relative">
                  <div className="text-xs text-slate-400 mb-1">Simulated Impact</div>
                  <div
                    className={`text-2xl font-bold font-mono ${
                      simResult.score_delta < 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {simResult.score_delta > 0 ? `+${simResult.score_delta.toFixed(1)}` : simResult.score_delta.toFixed(1)} Pts
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Cascading Shift</div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">Post-Shock Score</div>
                  <div className="text-2xl font-bold font-mono text-rose-400">
                    {simResult.simulated_dna.composite_score.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-rose-300 mt-1">{simResult.simulated_dna.health_verdict}</div>
                </div>
              </div>

              {/* Dual Overlay Radar */}
              <SevenDimensionRadarChart
                subScores={simResult.original_dna.sub_scores}
                simulatedSubScores={simResult.simulated_dna.sub_scores}
                title={`Shocks Fingerprint: ${selectedComp?.name}`}
                height={320}
              />

              {/* Diagnostics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Needle Mover Attribution */}
                <div className="glass-panel p-5 border-amber-500/20 bg-amber-950/10">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-2">
                    <TrendingDown size={18} />
                    Needle-Mover Attribution
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium mb-3">
                    {simResult.needle_mover.summary}
                  </p>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-amber-500/20">
                    <span className="text-slate-400">Primary Impact:</span>
                    <span className="font-mono text-amber-300 font-bold">
                      {simResult.needle_mover.impact_pct.toFixed(1)}% degradation
                    </span>
                  </div>
                </div>

                {/* Recovery Timeline */}
                <div className="glass-panel p-5 border-cyan-500/20 bg-cyan-950/10">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm mb-2">
                    <Clock size={18} />
                    Estimated Recovery Timeline
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-100 mb-1">
                    {simResult.recovery_timeline.estimated_quarters_to_recover} Quarters
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {simResult.recovery_timeline.recommendation}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
