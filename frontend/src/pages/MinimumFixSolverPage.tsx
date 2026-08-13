import React, { useState, useEffect } from 'react';
import { CompanySummary, runCounterfactual, CounterfactualResponse } from '../api/client';
import { CompanySelector } from '../components/CompanySelector';
import { ErrorBanner } from '../components/ErrorBanner';
import { Target, CheckCircle, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';

interface MinimumFixSolverPageProps {
  companies: CompanySummary[];
  selectedCompanyId: string;
  onSelectCompany: (id: string) => void;
  backendOnline: boolean | null;
}

export const MinimumFixSolverPage: React.FC<MinimumFixSolverPageProps> = ({
  companies,
  selectedCompanyId,
  onSelectCompany,
  backendOnline,
}) => {
  const [targetScore, setTargetScore] = useState<number>(70.0);
  const [result, setResult] = useState<CounterfactualResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFixes = async () => {
    if (!selectedCompanyId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await runCounterfactual(selectedCompanyId, targetScore);
      setResult(data);
    } catch (err: any) {
      setError("Backend Offline. Could not connect to http://localhost:8000/api/counterfactual");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFixes();
  }, [selectedCompanyId]);

  if (backendOnline === false || error) {
    return <ErrorBanner message={error || "Backend Offline"} onRetry={fetchFixes} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="glass-panel p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Target className="text-emerald-400" size={22} />
            Minimum Fix Counterfactual Solver
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Prescriptive inverse Optimization: calculate minimum single-lever intervention needed to reach target health
          </p>
        </div>

        <CompanySelector
          companies={companies}
          selectedId={selectedCompanyId}
          onSelectCompany={onSelectCompany}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Control Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6">
            <h3 className="text-base font-semibold text-slate-100 mb-4 pb-3 border-b border-slate-800 flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-400" /> Target Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Target DNA Score Threshold (0 - 100)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="1"
                    value={targetScore}
                    onChange={(e) => setTargetScore(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-lg font-mono font-bold text-cyan-400 min-w-[50px] text-right">
                    {targetScore}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400">
                <div className="text-slate-200 font-semibold mb-1">Inverse Counterfactual Physics</div>
                Determines the smallest operational pivot required (e.g. debt payoff, margin expansion) to cross target resilience.
              </div>

              <button
                onClick={fetchFixes}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Target size={16} /> Compute Prescriptive Fixes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Output Section */}
        <div className="lg:col-span-8 space-y-6">
          {result && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-panel p-4 text-center">
                  <div className="text-xs text-slate-400">Current DNA Score</div>
                  <div className="text-2xl font-bold font-mono text-slate-200 mt-1">
                    {result.current_score.toFixed(1)}
                  </div>
                </div>
                <div className="glass-panel p-4 text-center">
                  <div className="text-xs text-slate-400">Target Score</div>
                  <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                    {result.target_score.toFixed(1)}
                  </div>
                </div>
                <div className="glass-panel p-4 text-center">
                  <div className="text-xs text-slate-400">Required Gap</div>
                  <div
                    className={`text-2xl font-bold font-mono mt-1 ${
                      result.score_gap <= 0 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {result.score_gap <= 0 ? 'Goal Reached' : `+${result.score_gap.toFixed(1)} Pts`}
                  </div>
                </div>
              </div>

              {/* Recommendations List */}
              <div className="glass-panel p-6">
                <h3 className="text-base font-semibold text-slate-100 mb-4 pb-3 border-b border-slate-800 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-400" />
                  Prescriptive "Minimum Fix" Interventions
                </h3>

                {result.minimum_fixes.length === 0 ? (
                  <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center gap-2">
                    <CheckCircle size={18} />
                    Enterprise baseline score ({result.current_score.toFixed(1)}) already meets or exceeds target threshold ({result.target_score})!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {result.minimum_fixes.map((fix, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
                            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-xs font-mono">
                              {idx + 1}
                            </span>
                            {fix.action}
                          </div>
                          <p className="text-xs text-slate-300 font-medium pl-7">
                            {fix.requirement}
                          </p>
                          <span className="inline-block font-mono text-[10px] text-slate-400 pl-7">
                            Target Lever: <span className="text-cyan-300">{fix.lever}</span>
                          </span>
                        </div>

                        <div className="sm:text-right pl-7 sm:pl-0">
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                            Resulting DNA Score
                          </div>
                          <div className="text-lg font-bold font-mono text-emerald-400 flex items-center sm:justify-end gap-1">
                            {fix.resulting_score.toFixed(1)}
                            <ArrowUpRight size={16} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
