import React, { useState } from 'react';
import { calculateCustomScore, CalculateScoreResponse, CalculateScoreRequest } from '../api/client';
import { CompositeScoreCard } from '../components/CompositeScoreCard';
import { SevenDimensionRadarChart } from '../components/RadarChart';
import { ErrorBanner } from '../components/ErrorBanner';
import { Calculator, Play, RotateCcw } from 'lucide-react';

interface CustomCalculatorPageProps {
  backendOnline: boolean | null;
}

export const CustomCalculatorPage: React.FC<CustomCalculatorPageProps> = ({ backendOnline }) => {
  const defaultForm: CalculateScoreRequest = {
    revenue_growth: 12.0,
    net_profit_margin: 15.0,
    cash_conversion: 1.1,
    debt_to_equity: 0.4,
    current_ratio: 1.8,
    working_capital_ratio: 0.2,
    revenue_std_dev_ratio: 0.05,
  };

  const [form, setForm] = useState<CalculateScoreRequest>(defaultForm);
  const [result, setResult] = useState<CalculateScoreResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await calculateCustomScore(form);
      setResult(res);
    } catch (err: any) {
      setError("Backend Offline. Could not reach http://localhost:8000/api/calculate-score");
    } finally {
      setLoading(false);
    }
  };

  if (backendOnline === false || error) {
    return <ErrorBanner message={error || "Backend Offline"} onRetry={() => handleSubmit()} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="glass-panel p-5">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Calculator className="text-cyan-400" size={22} />
          Custom Financial DNA Score Calculator
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Input custom balance sheet & financial ratios to calculate instant 7-dimension DNA score
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Raw Metrics Entry
              </h3>
              <button
                type="button"
                onClick={() => setForm(defaultForm)}
                className="text-xs flex items-center gap-1 text-slate-400 hover:text-cyan-400"
              >
                <RotateCcw size={12} /> Reset Defaults
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Revenue Growth % (YoY)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.revenue_growth}
                  onChange={(e) => setForm({ ...form, revenue_growth: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Net Profit Margin %
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.net_profit_margin}
                  onChange={(e) => setForm({ ...form, net_profit_margin: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Cash Conversion Ratio (OCF / Net Income)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={form.cash_conversion}
                  onChange={(e) => setForm({ ...form, cash_conversion: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Debt-to-Equity Ratio
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={form.debt_to_equity}
                  onChange={(e) => setForm({ ...form, debt_to_equity: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Current Ratio (Assets / Liabilities)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.current_ratio}
                  onChange={(e) => setForm({ ...form, current_ratio: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Working Capital Ratio (WC / Revenue)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={form.working_capital_ratio}
                  onChange={(e) => setForm({ ...form, working_capital_ratio: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Quarterly Volatility Ratio (Std Dev / Rev)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.revenue_std_dev_ratio}
                  onChange={(e) => setForm({ ...form, revenue_std_dev_ratio: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:border-cyan-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Play size={16} /> Compute Financial DNA Score
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Calculated Results */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="space-y-6">
              <CompositeScoreCard
                score={result.composite_score}
                healthVerdict={result.health_verdict}
                companyName="Custom Financial Input Profile"
              />

              <SevenDimensionRadarChart subScores={result.sub_scores} height={340} />
            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-slate-400 font-mono">
              Fill out raw metrics on the left and click "Compute Financial DNA Score"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
